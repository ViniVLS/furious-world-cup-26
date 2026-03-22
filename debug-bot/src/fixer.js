// =============================================================================
// fixer.js — Auto-correction Engine
// Creates backups before modifications, uses ts-morph for AST-based fixes,
// and supports rollback via backup restoration.
// =============================================================================

import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';

/**
 * @typedef {Object} FixResult
 * @property {boolean} success
 * @property {string} filePath
 * @property {string} [backupPath]
 * @property {string} [error]
 * @property {string} ruleId
 * @property {number} line
 * @property {string} description
 */

/**
 * @typedef {Object} BackupEntry
 * @property {string} originalPath
 * @property {string} backupPath
 * @property {string} timestamp
 * @property {string} ruleId
 * @property {string} description
 */

export class Fixer {
  /** @type {string} */
  #projectRoot;

  /** @type {string} */
  #backupDir;

  /** @type {string} */
  #logDir;

  /** @type {BackupEntry[]} */
  #backupHistory = [];

  /** @type {Project} */
  #project;

  /**
   * @param {string} projectRoot
   */
  constructor(projectRoot) {
    this.#projectRoot = projectRoot;
    this.#backupDir = path.join(projectRoot, 'debug-bot', 'backups');
    this.#logDir = path.join(projectRoot, 'debug-bot', 'logs');

    // Ensure directories exist
    if (!fs.existsSync(this.#backupDir)) {
      fs.mkdirSync(this.#backupDir, { recursive: true });
    }
    if (!fs.existsSync(this.#logDir)) {
      fs.mkdirSync(this.#logDir, { recursive: true });
    }

    // Load backup history
    const historyFile = path.join(this.#backupDir, 'history.json');
    if (fs.existsSync(historyFile)) {
      try {
        this.#backupHistory = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
      } catch {
        this.#backupHistory = [];
      }
    }

    // Initialize ts-morph project
    const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      this.#project = new Project({
        tsConfigFilePath: tsConfigPath,
        skipAddingFilesFromTsConfig: true,
      });
    } else {
      this.#project = new Project({
        compilerOptions: { target: 99, module: 99, strict: true },
      });
    }
  }

  /**
   * Create a timestamped backup of a file before modification.
   * @param {string} filePath - Absolute path to the file
   * @param {string} ruleId - The rule that triggered the fix
   * @param {string} description - Description of the fix being applied
   * @returns {string} Path to the backup file
   */
  createBackup(filePath, ruleId, description) {
    const relativePath = path.relative(this.#projectRoot, filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = relativePath.replace(/[\\/]/g, '__');
    const backupFileName = `${timestamp}__${safeName}`;
    const backupPath = path.join(this.#backupDir, backupFileName);

    // Copy the original file
    fs.copyFileSync(filePath, backupPath);

    // Record in history
    /** @type {BackupEntry} */
    const entry = {
      originalPath: filePath,
      backupPath,
      timestamp: new Date().toISOString(),
      ruleId,
      description,
    };
    this.#backupHistory.push(entry);
    this.#saveBackupHistory();

    return backupPath;
  }

  /**
   * Apply a fix to a file based on an AnalysisResult.
   * @param {import('./analyzer.js').AnalysisResult} result
   * @returns {FixResult}
   */
  applyFix(result) {
    try {
      const { filePath, line, currentCode, suggestedFix, ruleId, explanation } = result;

      // Validate the file exists
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          filePath,
          ruleId,
          line,
          description: explanation,
          error: `Arquivo não encontrado: ${filePath}`,
        };
      }

      // Create backup
      const backupPath = this.createBackup(filePath, ruleId, explanation);

      // Read the current file content
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // Find and replace the target code
      let modified = false;

      // Strategy 1: Try exact line replacement
      if (line >= 1 && line <= lines.length) {
        const targetLine = lines[line - 1];
        if (targetLine.includes(currentCode.split('\n')[0].trim())) {
          // For simple single-line fixes, replace inline
          if (!suggestedFix.includes('\n') && !currentCode.includes('\n')) {
            lines[line - 1] = targetLine.replace(currentCode.trim(), suggestedFix.trim());
            modified = true;
          }
        }
      }

      // Strategy 2: Use ts-morph for AST-based replacement
      if (!modified) {
        try {
          let sourceFile = this.#project.getSourceFile(filePath);
          if (sourceFile) {
            sourceFile.replaceWithText(content);
          } else {
            sourceFile = this.#project.createSourceFile(filePath, content, { overwrite: true });
          }

          // Find the node at the specified line
          const lineStart = sourceFile.getFullText().split('\n').slice(0, line - 1).join('\n').length;
          const node = sourceFile.getDescendantAtPos(lineStart + 1);

          if (node) {
            const nodeText = node.getText();
            if (nodeText.includes(currentCode.trim()) || currentCode.trim().includes(nodeText.trim())) {
              // Replace in text
              const newContent = content.replace(currentCode.trim(), suggestedFix.trim());
              if (newContent !== content) {
                fs.writeFileSync(filePath, newContent, 'utf-8');
                modified = true;
              }
            }
          }
        } catch {
          // AST approach failed, try text replacement
        }
      }

      // Strategy 3: Simple text replacement as fallback
      if (!modified) {
        const newContent = content.replace(currentCode.trim(), suggestedFix.trim());
        if (newContent !== content) {
          fs.writeFileSync(filePath, newContent, 'utf-8');
          modified = true;
        }
      }

      if (modified) {
        if (!modified) {
          // Already written by strategy 2
        } else {
          const newContent = lines.join('\n');
          // Only write if strategy 1 was used
          if (content.split('\n').length === lines.length) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
          }
        }

        // Log the fix
        this.#logAction('fix-applied', {
          filePath,
          line,
          ruleId,
          explanation,
          backupPath,
        });

        return {
          success: true,
          filePath,
          backupPath,
          ruleId,
          line,
          description: explanation,
        };
      }

      return {
        success: false,
        filePath,
        backupPath,
        ruleId,
        line,
        description: explanation,
        error: 'Não foi possível localizar o trecho de código a ser corrigido.',
      };
    } catch (err) {
      return {
        success: false,
        filePath: result.filePath,
        ruleId: result.ruleId,
        line: result.line,
        description: result.explanation,
        error: err.message,
      };
    }
  }

  /**
   * Rollback a fix by restoring the backup.
   * @param {string} backupPath - Path to the backup file
   * @returns {{ success: boolean, error?: string }}
   */
  rollback(backupPath) {
    try {
      const entry = this.#backupHistory.find((e) => e.backupPath === backupPath);
      if (!entry) {
        return { success: false, error: 'Backup não encontrado no histórico.' };
      }

      if (!fs.existsSync(backupPath)) {
        return { success: false, error: 'Arquivo de backup não existe mais.' };
      }

      // Restore the original file
      fs.copyFileSync(backupPath, entry.originalPath);

      this.#logAction('rollback', {
        originalPath: entry.originalPath,
        backupPath,
        ruleId: entry.ruleId,
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Rollback the most recent fix.
   * @returns {{ success: boolean, error?: string, entry?: BackupEntry }}
   */
  rollbackLast() {
    if (this.#backupHistory.length === 0) {
      return { success: false, error: 'Nenhum backup disponível para rollback.' };
    }

    const lastEntry = this.#backupHistory[this.#backupHistory.length - 1];
    const result = this.rollback(lastEntry.backupPath);
    return { ...result, entry: lastEntry };
  }

  /**
   * Get the backup history.
   * @returns {BackupEntry[]}
   */
  getBackupHistory() {
    return [...this.#backupHistory];
  }

  /**
   * Log an action to the log file.
   * @param {string} action
   * @param {Object} details
   */
  #logAction(action, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      ...details,
    };

    const logFile = path.join(this.#logDir, 'debug-bot.log');
    const line = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(logFile, line, 'utf-8');
  }

  /**
   * Save the backup history to disk.
   */
  #saveBackupHistory() {
    const historyFile = path.join(this.#backupDir, 'history.json');
    fs.writeFileSync(historyFile, JSON.stringify(this.#backupHistory, null, 2), 'utf-8');
  }

  /**
   * Clean up old backups (keep last N).
   * @param {number} [keepCount=50]
   */
  cleanupBackups(keepCount = 50) {
    if (this.#backupHistory.length <= keepCount) return;

    const toRemove = this.#backupHistory.slice(0, this.#backupHistory.length - keepCount);
    for (const entry of toRemove) {
      try {
        if (fs.existsSync(entry.backupPath)) {
          fs.unlinkSync(entry.backupPath);
        }
      } catch {
        // Skip
      }
    }

    this.#backupHistory = this.#backupHistory.slice(-keepCount);
    this.#saveBackupHistory();

    this.#logAction('cleanup', { removed: toRemove.length, remaining: this.#backupHistory.length });
  }
}
