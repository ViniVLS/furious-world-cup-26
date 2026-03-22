// =============================================================================
// analyzer.js — Intelligent Analysis Engine
// Uses ts-morph for AST-based TypeScript analysis to detect common errors,
// identify root causes, and generate fix suggestions.
// =============================================================================

import { Project, SyntaxKind, Node } from 'ts-morph';
import path from 'path';
import fs from 'fs';

/**
 * @typedef {Object} AnalysisResult
 * @property {string} ruleId - Unique rule identifier
 * @property {'error'|'warning'|'suggestion'} severity
 * @property {string} filePath - Absolute path to the affected file
 * @property {number} line - Line number (1-based)
 * @property {number} [column] - Column number (1-based)
 * @property {string} currentCode - The current code snippet
 * @property {string} suggestedFix - The suggested replacement code
 * @property {string} explanation - Human-readable explanation of the fix
 * @property {string} ruleName - Display name of the rule
 */

/**
 * @typedef {Object} AnalysisRule
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {'error'|'warning'|'suggestion'} severity
 * @property {(sourceFile: import('ts-morph').SourceFile, filePath: string) => AnalysisResult[]} analyze
 */

export class Analyzer {
  /** @type {Project} */
  #project;

  /** @type {string} */
  #projectRoot;

  /** @type {AnalysisRule[]} */
  #rules = [];

  /** @type {Map<string, AnalysisResult[]>} */
  #cache = new Map();

  /**
   * @param {string} projectRoot
   */
  constructor(projectRoot) {
    this.#projectRoot = projectRoot;

    // Initialize ts-morph project
    const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      this.#project = new Project({
        tsConfigFilePath: tsConfigPath,
        skipAddingFilesFromTsConfig: true,
      });
    } else {
      this.#project = new Project({
        compilerOptions: {
          target: 99, // ESNext
          module: 99,
          strict: true,
        },
      });
    }

    // Register built-in analysis rules
    this.#registerBuiltinRules();
  }

  /**
   * Register all built-in analysis rules.
   */
  #registerBuiltinRules() {
    // ── Rule 1: Missing null/undefined checks ────────────────────────────
    this.#rules.push({
      id: 'null-check',
      name: 'Missing Null Check',
      description: 'Detects property access on potentially null/undefined values',
      severity: 'error',
      analyze: (sourceFile, filePath) => {
        /** @type {AnalysisResult[]} */
        const results = [];

        sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression).forEach((node) => {
          const expr = node.getExpression();
          const text = expr.getText();

          // Check for common nullable patterns
          if (
            text.includes('.find(') ||
            text.includes('.get(') ||
            text.endsWith('?') ||
            text.includes('| undefined') ||
            text.includes('| null')
          ) {
            const parent = node.getParent();
            // If parent is already an optional chain, skip
            if (parent && Node.isNonNullExpression(parent)) return;
            if (node.hasQuestionDotToken()) return;

            const line = node.getStartLineNumber();
            const currentCode = node.getText();
            const name = node.getName();
            const suggestedFix = `${text}?.${name}`;

            results.push({
              ruleId: 'null-check',
              severity: 'error',
              filePath,
              line,
              column: node.getStart() - node.getSourceFile().getLineStarts()[line - 1] + 1,
              currentCode,
              suggestedFix,
              explanation: `O valor '${text}' pode ser null/undefined. Use optional chaining (?.) para evitar erros em runtime.`,
              ruleName: 'Missing Null Check',
            });
          }
        });

        return results;
      },
    });

    // ── Rule 2: Unsubscribed Observables ─────────────────────────────────
    this.#rules.push({
      id: 'unsubscribed-observable',
      name: 'Unsubscribed Observable',
      description: 'Detects .subscribe() calls without corresponding unsubscribe in ngOnDestroy',
      severity: 'warning',
      analyze: (sourceFile, filePath) => {
        /** @type {AnalysisResult[]} */
        const results = [];

        const classes = sourceFile.getClasses();
        for (const cls of classes) {
          // Check if it's an Angular component/directive (has @Component or @Directive)
          const decorators = cls.getDecorators();
          const isAngular = decorators.some(
            (d) => d.getName() === 'Component' || d.getName() === 'Directive'
          );
          if (!isAngular) continue;

          // Find all .subscribe() calls
          const subscribeCalls = cls.getDescendantsOfKind(SyntaxKind.CallExpression).filter((call) => {
            const expr = call.getExpression();
            return Node.isPropertyAccessExpression(expr) && expr.getName() === 'subscribe';
          });

          if (subscribeCalls.length === 0) continue;

          // Check if ngOnDestroy exists
          const hasOnDestroy = cls.getMethod('ngOnDestroy') !== undefined;
          // Check for DestroyRef / takeUntilDestroyed
          const classText = cls.getText();
          const hasDestroyRef = classText.includes('DestroyRef') || classText.includes('takeUntilDestroyed');
          const hasAsyncPipe = false; // Can't easily check template from here

          if (!hasOnDestroy && !hasDestroyRef) {
            for (const call of subscribeCalls) {
              const line = call.getStartLineNumber();
              results.push({
                ruleId: 'unsubscribed-observable',
                severity: 'warning',
                filePath,
                line,
                currentCode: call.getText().substring(0, 80),
                suggestedFix: `// Adicione DestroyRef + takeUntilDestroyed() ou implemente ngOnDestroy\n${call.getText()}`,
                explanation:
                  'Observable subscrito sem unsubscribe. Isso pode causar memory leaks. Use takeUntilDestroyed() com DestroyRef do Angular ou implemente OnDestroy.',
                ruleName: 'Unsubscribed Observable',
              });
            }
          }
        }

        return results;
      },
    });

    // ── Rule 3: Console statements left in code ──────────────────────────
    this.#rules.push({
      id: 'console-statement',
      name: 'Console Statement',
      description: 'Detects console.log/warn/error statements that should use DebugService',
      severity: 'suggestion',
      analyze: (sourceFile, filePath) => {
        /** @type {AnalysisResult[]} */
        const results = [];

        // Skip debug-related files
        if (filePath.includes('debug.service') || filePath.includes('debug-bot')) return results;

        sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
          const expr = call.getExpression();
          if (!Node.isPropertyAccessExpression(expr)) return;

          const obj = expr.getExpression();
          if (obj.getText() !== 'console') return;

          const method = expr.getName();
          if (!['log', 'warn', 'error', 'info'].includes(method)) return;

          const line = call.getStartLineNumber();
          const currentCode = call.getText();
          const debugMethod = method === 'log' ? 'debug' : method;

          results.push({
            ruleId: 'console-statement',
            severity: 'suggestion',
            filePath,
            line,
            currentCode: currentCode.substring(0, 100),
            suggestedFix: `this.debug.${debugMethod}('METHOD', 'ServiceName', ${call.getArguments().map((a) => a.getText()).join(', ')})`,
            explanation: `Use DebugService ao invés de console.${method}() para centralizar logs e permitir análise automatizada.`,
            ruleName: 'Console Statement',
          });
        });

        return results;
      },
    });

    // ── Rule 4: Empty catch blocks ───────────────────────────────────────
    this.#rules.push({
      id: 'empty-catch',
      name: 'Empty Catch Block',
      description: 'Detects empty catch blocks that silently swallow errors',
      severity: 'error',
      analyze: (sourceFile, filePath) => {
        /** @type {AnalysisResult[]} */
        const results = [];

        sourceFile.getDescendantsOfKind(SyntaxKind.CatchClause).forEach((catchClause) => {
          const block = catchClause.getBlock();
          const statements = block.getStatements();

          if (statements.length === 0) {
            const line = catchClause.getStartLineNumber();
            const varDecl = catchClause.getVariableDeclaration();
            const varName = varDecl ? varDecl.getName() : 'error';

            results.push({
              ruleId: 'empty-catch',
              severity: 'error',
              filePath,
              line,
              currentCode: `catch${varDecl ? ` (${varName})` : ''} {}`,
              suggestedFix: `catch (${varName}) {\n  console.error('Unhandled error:', ${varName});\n}`,
              explanation:
                'Bloco catch vazio silencia erros. Adicione ao menos um log para facilitar o debug.',
              ruleName: 'Empty Catch Block',
            });
          }
        });

        return results;
      },
    });

    // ── Rule 5: Unused imports ───────────────────────────────────────────
    this.#rules.push({
      id: 'unused-import',
      name: 'Unused Import',
      description: 'Detects imported symbols that are not used in the file',
      severity: 'warning',
      analyze: (sourceFile, filePath) => {
        /** @type {AnalysisResult[]} */
        const results = [];

        const imports = sourceFile.getImportDeclarations();
        for (const imp of imports) {
          const namedImports = imp.getNamedImports();
          for (const named of namedImports) {
            const name = named.getName();
            const refs = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).filter(
              (id) => id.getText() === name && id !== named.getNameNode()
            );

            if (refs.length === 0) {
              const line = named.getStartLineNumber();
              results.push({
                ruleId: 'unused-import',
                severity: 'warning',
                filePath,
                line,
                currentCode: `import { ..., ${name}, ... }`,
                suggestedFix: `// Remover '${name}' da lista de imports`,
                explanation: `O import '${name}' não é utilizado neste arquivo. Remova-o para manter o código limpo.`,
                ruleName: 'Unused Import',
              });
            }
          }
        }

        return results;
      },
    });

    // ── Rule 6: Async without await ──────────────────────────────────────
    this.#rules.push({
      id: 'async-no-await',
      name: 'Async Without Await',
      description: 'Detects async functions that never use await',
      severity: 'warning',
      analyze: (sourceFile, filePath) => {
        /** @type {AnalysisResult[]} */
        const results = [];

        const functions = [
          ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration),
          ...sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration),
          ...sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction),
        ];

        for (const fn of functions) {
          if (!fn.isAsync()) continue;

          const body = fn.getBody();
          if (!body) continue;

          const awaitExpressions = body.getDescendantsOfKind(SyntaxKind.AwaitExpression);
          // Exclude nested async functions
          const ownAwaits = awaitExpressions.filter((aw) => {
            let parent = aw.getParent();
            while (parent && parent !== fn) {
              if (
                Node.isFunctionDeclaration(parent) ||
                Node.isMethodDeclaration(parent) ||
                Node.isArrowFunction(parent) ||
                Node.isFunctionExpression(parent)
              ) {
                return false;
              }
              parent = parent.getParent();
            }
            return true;
          });

          if (ownAwaits.length === 0) {
            const line = fn.getStartLineNumber();
            let name = 'anonymous';

            if (Node.isFunctionDeclaration(fn) || Node.isMethodDeclaration(fn)) {
              name = fn.getName() || 'anonymous';
            }

            results.push({
              ruleId: 'async-no-await',
              severity: 'warning',
              filePath,
              line,
              currentCode: `async ${name}(...)`,
              suggestedFix: `// Remova 'async' se não usa 'await', ou adicione 'await' onde necessário`,
              explanation: `A função '${name}' é marcada como async mas nunca usa await. Isso é desnecessário e pode causar confusão.`,
              ruleName: 'Async Without Await',
            });
          }
        }

        return results;
      },
    });

    // ── Rule 7: Type assertion to 'any' ──────────────────────────────────
    this.#rules.push({
      id: 'any-type-assertion',
      name: 'Type Assertion to Any',
      description: "Detects 'as any' type assertions that bypass type safety",
      severity: 'warning',
      analyze: (sourceFile, filePath) => {
        /** @type {AnalysisResult[]} */
        const results = [];

        sourceFile.getDescendantsOfKind(SyntaxKind.AsExpression).forEach((asExpr) => {
          const typeNode = asExpr.getTypeNode();
          if (typeNode && typeNode.getText() === 'any') {
            const line = asExpr.getStartLineNumber();
            results.push({
              ruleId: 'any-type-assertion',
              severity: 'warning',
              filePath,
              line,
              currentCode: asExpr.getText().substring(0, 80),
              suggestedFix: `// Use um tipo mais específico ao invés de 'as any'`,
              explanation: "Uso de 'as any' remove completamente a segurança de tipos. Defina o tipo correto.",
              ruleName: 'Type Assertion to Any',
            });
          }
        });

        return results;
      },
    });
  }

  /**
   * Analyze a single file and return all detected issues.
   * @param {string} filePath - Absolute path to the file
   * @returns {AnalysisResult[]}
   */
  analyzeFile(filePath) {
    try {
      const absolutePath = path.resolve(filePath);
      if (!fs.existsSync(absolutePath)) return [];
      if (!absolutePath.endsWith('.ts')) return [];

      // Skip node_modules, spec files, and debug-bot files
      if (
        absolutePath.includes('node_modules') ||
        absolutePath.includes('.spec.ts') ||
        absolutePath.includes('debug-bot')
      ) {
        return [];
      }

      const content = fs.readFileSync(absolutePath, 'utf-8');

      // Add or refresh the source file in the project
      let sourceFile = this.#project.getSourceFile(absolutePath);
      if (sourceFile) {
        sourceFile.replaceWithText(content);
      } else {
        sourceFile = this.#project.createSourceFile(absolutePath, content, { overwrite: true });
      }

      /** @type {AnalysisResult[]} */
      const results = [];

      for (const rule of this.#rules) {
        try {
          const ruleResults = rule.analyze(sourceFile, absolutePath);
          results.push(...ruleResults);
        } catch (err) {
          // Rule failed, skip it
          console.error(`Rule '${rule.id}' failed for ${path.basename(absolutePath)}: ${err.message}`);
        }
      }

      // Update cache
      this.#cache.set(absolutePath, results);

      return results;
    } catch (err) {
      console.error(`Analysis failed for ${filePath}: ${err.message}`);
      return [];
    }
  }

  /**
   * Analyze a log entry and correlate with source code issues.
   * @param {import('./watcher.js').LogEntry} logEntry
   * @returns {AnalysisResult[]}
   */
  analyzeLogEntry(logEntry) {
    /** @type {AnalysisResult[]} */
    const results = [];

    // Only process ERROR and WARN entries
    if (logEntry.level !== 'ERROR' && logEntry.level !== 'WARN') {
      return results;
    }

    // Try to find the related source file from the service name
    const serviceName = logEntry.service;
    const possibleFiles = this.#findFilesByServiceName(serviceName);

    for (const file of possibleFiles) {
      const fileResults = this.analyzeFile(file);
      results.push(...fileResults);
    }

    // If log message contains a file path and line number, analyze that specific file
    const fileLineMatch = logEntry.message.match(/(?:at\s+)?([^\s(]+\.ts):(\d+)/);
    if (fileLineMatch) {
      const targetFile = path.resolve(this.#projectRoot, fileLineMatch[1]);
      if (fs.existsSync(targetFile)) {
        const fileResults = this.analyzeFile(targetFile);
        results.push(...fileResults);
      }
    }

    return results;
  }

  /**
   * Search for source files that might contain a given service/component.
   * @param {string} serviceName
   * @returns {string[]}
   */
  #findFilesByServiceName(serviceName) {
    const srcDir = path.join(this.#projectRoot, 'src');
    const possibleNames = [
      this.#toKebabCase(serviceName) + '.ts',
      this.#toKebabCase(serviceName) + '.service.ts',
      this.#toKebabCase(serviceName) + '.component.ts',
    ];

    /** @type {string[]} */
    const found = [];

    const searchDir = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            searchDir(fullPath);
          } else if (possibleNames.some((n) => entry.name === n || entry.name.includes(this.#toKebabCase(serviceName)))) {
            found.push(fullPath);
          }
        }
      } catch {
        // Skip inaccessible dirs
      }
    };

    searchDir(srcDir);
    return found;
  }

  /**
   * Convert PascalCase/camelCase to kebab-case.
   * @param {string} str
   * @returns {string}
   */
  #toKebabCase(str) {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();
  }

  /**
   * Get all cached results.
   * @returns {Map<string, AnalysisResult[]>}
   */
  getCachedResults() {
    return new Map(this.#cache);
  }

  /**
   * Clear the analysis cache.
   */
  clearCache() {
    this.#cache.clear();
  }

  /**
   * Add a custom analysis rule (for future AI integration).
   * @param {AnalysisRule} rule
   */
  addRule(rule) {
    this.#rules.push(rule);
  }

  /**
   * Get all registered rules.
   * @returns {AnalysisRule[]}
   */
  getRules() {
    return [...this.#rules];
  }

  /**
   * Get the ts-morph project instance (for advanced usage).
   * @returns {Project}
   */
  getProject() {
    return this.#project;
  }
}
