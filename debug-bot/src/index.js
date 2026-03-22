// =============================================================================
// index.js — Debug Bot Main Orchestrator
// Entry point that initializes all modules, runs the interactive CLI loop,
// and coordinates the pipeline: watch → analyze → suggest → fix
// =============================================================================

import { Watcher } from './watcher.js';
import { Analyzer } from './analyzer.js';
import { Fixer } from './fixer.js';
import { UIBridge } from './ui-bridge.js';
import chalk from 'chalk';
import readline from 'readline';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Project root: one level up from debug-bot/src ───────────────────────────
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// ── Configuration ───────────────────────────────────────────────────────────
const CONFIG = {
  wsPort: 9876,
  logDir: path.join(PROJECT_ROOT, 'debug-bot', 'logs'),
  backupDir: path.join(PROJECT_ROOT, 'debug-bot', 'backups'),
  analyzeLevels: ['ERROR', 'WARN'],
};

// ── ASCII Banner ────────────────────────────────────────────────────────────
const BANNER = `
${chalk.hex('#FF6600').bold('╔══════════════════════════════════════════════════════════════╗')}
${chalk.hex('#FF6600').bold('║')}  ${chalk.white.bold('🤖 FURIOUS DEBUG BOT')} ${chalk.gray('v1.0.0')}                                  ${chalk.hex('#FF6600').bold('║')}
${chalk.hex('#FF6600').bold('║')}  ${chalk.gray('Automated Log Analyzer & Fixer')}                              ${chalk.hex('#FF6600').bold('║')}
${chalk.hex('#FF6600').bold('║')}  ${chalk.gray('Furious World Cup 26')}                                        ${chalk.hex('#FF6600').bold('║')}
${chalk.hex('#FF6600').bold('╚══════════════════════════════════════════════════════════════╝')}
`;

// ── Module Instances ────────────────────────────────────────────────────────
const watcher = new Watcher(PROJECT_ROOT);
const analyzer = new Analyzer(PROJECT_ROOT);
const fixer = new Fixer(PROJECT_ROOT);
const bridge = new UIBridge(CONFIG.wsPort);

/** @type {import('./analyzer.js').AnalysisResult[]} */
let pendingResults = [];

/** @type {boolean} */
let isProcessing = false;

/** @type {readline.Interface} */
let rl;

// ── Logging ─────────────────────────────────────────────────────────────────
function logBot(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  const prefix = {
    info: chalk.blue('ℹ'),
    success: chalk.green('✔'),
    warn: chalk.yellow('⚠'),
    error: chalk.red('✖'),
    debug: chalk.gray('◈'),
  }[type] || chalk.gray('·');

  console.log(`  ${chalk.gray(timestamp)} ${prefix} ${message}`);

  // Also log to file
  const logEntry = { timestamp: new Date().toISOString(), type, message: message.replace(/\x1b\[[0-9;]*m/g, '') };
  const logFile = path.join(CONFIG.logDir, 'debug-bot.log');
  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf-8');
  } catch { /* silent */ }
}

// ── Display Analysis Result ─────────────────────────────────────────────────
function displayResult(result, index) {
  const severityColor = {
    error: chalk.red,
    warning: chalk.yellow,
    suggestion: chalk.cyan,
  }[result.severity] || chalk.white;

  const severityIcon = {
    error: '🔴',
    warning: '🟡',
    suggestion: '🔵',
  }[result.severity] || '⚪';

  const relPath = path.relative(PROJECT_ROOT, result.filePath);

  console.log('');
  console.log(chalk.hex('#FF6600').bold(`  ┌─── Issue #${index + 1} ───────────────────────────────────────────`));
  console.log(`  │ ${severityIcon} ${severityColor.bold(result.severity.toUpperCase())} — ${chalk.white.bold(result.ruleName)}`);
  console.log(`  │ ${chalk.gray('Arquivo:')} ${chalk.cyan(relPath)}:${chalk.yellow(result.line)}`);
  console.log(`  │`);
  console.log(`  │ ${chalk.gray('Código atual:')}`);
  console.log(`  │   ${chalk.red(result.currentCode)}`);
  console.log(`  │`);
  console.log(`  │ ${chalk.gray('Sugestão de correção:')}`);
  console.log(`  │   ${chalk.green(result.suggestedFix)}`);
  console.log(`  │`);
  console.log(`  │ ${chalk.gray('Explicação:')} ${result.explanation}`);
  console.log(chalk.hex('#FF6600').bold(`  └────────────────────────────────────────────────────────────`));
}

// ── Interactive Prompt ──────────────────────────────────────────────────────
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// ── Process a Single Result Interactively ───────────────────────────────────
async function processResultInteractively(result, index) {
  displayResult(result, index);

  console.log('');
  console.log(
    `  ${chalk.hex('#FF6600').bold('[1]')} Aplicar correção   ${chalk.gray('|')}   ${chalk.hex('#FF6600').bold('[2]')} Ignorar   ${chalk.gray('|')}   ${chalk.hex('#FF6600').bold('[3]')} Rollback último`
  );

  const answer = await prompt(chalk.hex('#FF6600')('  ► Escolha: '));

  switch (answer) {
    case '1': {
      logBot('Aplicando correção...', 'info');
      const fixResult = fixer.applyFix(result);
      if (fixResult.success) {
        logBot(`Correção aplicada com sucesso! Backup em: ${chalk.cyan(path.basename(fixResult.backupPath || ''))}`, 'success');
        bridge.broadcastFixApplied(fixResult);
      } else {
        logBot(`Falha ao aplicar correção: ${fixResult.error}`, 'error');
      }
      break;
    }
    case '2': {
      logBot('Ignorando sugestão.', 'warn');
      bridge.broadcastFixIgnored({
        filePath: result.filePath,
        line: result.line,
        ruleId: result.ruleId,
      });
      break;
    }
    case '3': {
      const rb = fixer.rollbackLast();
      if (rb.success) {
        logBot(`Rollback realizado com sucesso para: ${chalk.cyan(path.basename(rb.entry?.originalPath || ''))}`, 'success');
      } else {
        logBot(`Rollback falhou: ${rb.error}`, 'error');
      }
      break;
    }
    default:
      logBot('Opção inválida. Ignorando.', 'warn');
  }
}

// ── Process Pending Results ─────────────────────────────────────────────────
async function processPendingResults() {
  if (isProcessing || pendingResults.length === 0) return;

  isProcessing = true;

  console.log('');
  logBot(
    `${chalk.yellow.bold(pendingResults.length)} issue(s) detectada(s)! Analisando...`,
    'warn'
  );

  const results = [...pendingResults];
  pendingResults = [];

  for (let i = 0; i < results.length; i++) {
    await processResultInteractively(results[i], i);
  }

  console.log('');
  logBot('Aguardando novas mudanças...', 'info');
  isProcessing = false;
}

// ── Handle Source File Change ───────────────────────────────────────────────
function handleSourceChange(event) {
  const relPath = path.relative(PROJECT_ROOT, event.filePath);
  logBot(`Arquivo alterado: ${chalk.cyan(relPath)}`, 'debug');

  // Analyze the changed file
  const results = analyzer.analyzeFile(event.filePath);

  // Filter only ERROR and WARN severity
  const critical = results.filter((r) => r.severity === 'error' || r.severity === 'warning');

  if (critical.length > 0) {
    logBot(`${chalk.red.bold(critical.length)} problema(s) encontrado(s) em ${chalk.cyan(relPath)}`, 'warn');

    // Add to pending and broadcast
    for (const result of critical) {
      pendingResults.push(result);
      bridge.broadcastSuggestion(result);
    }

    // Process interactively (deferred to avoid blocking)
    setTimeout(() => processPendingResults(), 100);
  }
}

// ── Handle Log Entry ────────────────────────────────────────────────────────
function handleLogEntry(entry) {
  if (!CONFIG.analyzeLevels.includes(entry.level)) return;

  const levelColor = entry.level === 'ERROR' ? chalk.red : chalk.yellow;
  logBot(
    `LOG ${levelColor(entry.level)} [${entry.service}] ${entry.message}`,
    entry.level === 'ERROR' ? 'error' : 'warn'
  );

  // Broadcast to clients
  bridge.broadcastError(entry);

  // Analyze related files
  const results = analyzer.analyzeLogEntry(entry);
  const critical = results.filter((r) => r.severity === 'error' || r.severity === 'warning');

  if (critical.length > 0) {
    for (const result of critical) {
      pendingResults.push(result);
      bridge.broadcastSuggestion(result);
    }
    setTimeout(() => processPendingResults(), 100);
  }
}

// ── Handle Bridge Events ────────────────────────────────────────────────────
function setupBridgeHandlers() {
  bridge.on('apply-fix-request', (data) => {
    logBot(`Fix request recebido do frontend/extension: ${data.ruleId}`, 'info');

    // Find the matching result
    const result = pendingResults.find(
      (r) => r.filePath === data.filePath && r.line === data.line && r.ruleId === data.ruleId
    );

    if (result) {
      const fixResult = fixer.applyFix(result);
      bridge.broadcastFixApplied(fixResult);
      pendingResults = pendingResults.filter((r) => r !== result);

      if (fixResult.success) {
        logBot(`Correção aplicada via UI: ${path.basename(result.filePath)}:${result.line}`, 'success');
      }
    }
  });

  bridge.on('ignore-request', (data) => {
    logBot(`Ignorado via UI: ${data.ruleId}`, 'info');
    pendingResults = pendingResults.filter(
      (r) => !(r.filePath === data.filePath && r.line === data.line && r.ruleId === data.ruleId)
    );
    bridge.broadcastFixIgnored(data);
  });

  bridge.on('rollback-request', (data) => {
    const result = fixer.rollback(data.backupPath);
    bridge.broadcastResponse({
      type: 'rollback-result',
      payload: result,
      requestId: data.requestId,
    });
  });

  bridge.on('client-connected', (data) => {
    logBot(`Cliente conectado (${data.totalClients} total)`, 'info');
  });

  bridge.on('client-disconnected', (data) => {
    logBot(`Cliente desconectado (${data.totalClients} total)`, 'debug');
  });
}

// ── Command-line Commands ───────────────────────────────────────────────────
async function handleCommand(input) {
  const [cmd, ...args] = input.split(' ');

  switch (cmd) {
    case 'scan':
    case 's': {
      const targetDir = args[0] || path.join(PROJECT_ROOT, 'src');
      logBot(`Escaneando ${chalk.cyan(path.relative(PROJECT_ROOT, targetDir))}...`, 'info');
      scanDirectory(targetDir);
      break;
    }

    case 'rollback':
    case 'rb': {
      const rb = fixer.rollbackLast();
      if (rb.success) {
        logBot(`Rollback realizado: ${chalk.cyan(path.basename(rb.entry?.originalPath || ''))}`, 'success');
      } else {
        logBot(`Rollback falhou: ${rb.error}`, 'error');
      }
      break;
    }

    case 'history':
    case 'h': {
      const history = fixer.getBackupHistory();
      if (history.length === 0) {
        logBot('Nenhum backup no histórico.', 'info');
      } else {
        console.log('');
        logBot(`${history.length} backup(s) no histórico:`, 'info');
        for (const entry of history.slice(-10)) {
          console.log(
            `    ${chalk.gray(entry.timestamp)} ${chalk.cyan(path.basename(entry.originalPath))} — ${entry.ruleId}`
          );
        }
      }
      break;
    }

    case 'status':
    case 'st': {
      console.log('');
      logBot('Status do Debug Bot:', 'info');
      console.log(`    ${chalk.gray('Clientes WS:')} ${bridge.getClientCount()}`);
      console.log(`    ${chalk.gray('Issues pendentes:')} ${pendingResults.length}`);
      console.log(`    ${chalk.gray('Backups:')} ${fixer.getBackupHistory().length}`);
      console.log(`    ${chalk.gray('Regras ativas:')} ${analyzer.getRules().length}`);
      break;
    }

    case 'rules':
    case 'r': {
      const rules = analyzer.getRules();
      console.log('');
      logBot(`${rules.length} regra(s) de análise ativas:`, 'info');
      for (const rule of rules) {
        console.log(`    ${chalk.hex('#FF6600')('●')} ${chalk.white.bold(rule.id)} — ${rule.description}`);
      }
      break;
    }

    case 'clear':
    case 'c': {
      pendingResults = [];
      bridge.clearPending();
      logBot('Lista de issues pendentes limpa.', 'success');
      break;
    }

    case 'help':
    case '?': {
      console.log('');
      console.log(chalk.hex('#FF6600').bold('  Comandos disponíveis:'));
      console.log(`    ${chalk.white.bold('scan [dir]')}   ${chalk.gray('(s)')}  — Escanear diretório por issues`);
      console.log(`    ${chalk.white.bold('rollback')}     ${chalk.gray('(rb)')} — Rollback da última correção`);
      console.log(`    ${chalk.white.bold('history')}      ${chalk.gray('(h)')}  — Ver histórico de backups`);
      console.log(`    ${chalk.white.bold('status')}       ${chalk.gray('(st)')} — Status do bot`);
      console.log(`    ${chalk.white.bold('rules')}        ${chalk.gray('(r)')}  — Listar regras de análise`);
      console.log(`    ${chalk.white.bold('clear')}        ${chalk.gray('(c)')}  — Limpar issues pendentes`);
      console.log(`    ${chalk.white.bold('exit')}         ${chalk.gray('(q)')}  — Encerrar o bot`);
      console.log('');
      break;
    }

    case 'exit':
    case 'quit':
    case 'q': {
      await shutdown();
      break;
    }

    default:
      if (cmd) {
        logBot(`Comando desconhecido: '${cmd}'. Digite 'help' para ver comandos.`, 'warn');
      }
  }
}

// ── Directory Scanner ───────────────────────────────────────────────────────
function scanDirectory(dirPath) {
  let totalIssues = 0;

  function walk(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules' || entry.name.startsWith('.') || entry.name === 'debug-bot') continue;
          walk(fullPath);
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
          const results = analyzer.analyzeFile(fullPath);
          const critical = results.filter((r) => r.severity === 'error' || r.severity === 'warning');
          if (critical.length > 0) {
            totalIssues += critical.length;
            for (const result of critical) {
              pendingResults.push(result);
              bridge.broadcastSuggestion(result);
            }
          }
        }
      }
    } catch { /* skip inaccessible dirs */ }
  }

  walk(dirPath);

  if (totalIssues > 0) {
    logBot(`Scan completo: ${chalk.yellow.bold(totalIssues)} issue(s) encontrada(s)`, 'warn');
    setTimeout(() => processPendingResults(), 100);
  } else {
    logBot('Scan completo: nenhuma issue encontrada! 🎉', 'success');
  }
}

// ── Graceful Shutdown ───────────────────────────────────────────────────────
async function shutdown() {
  console.log('');
  logBot('Encerrando Debug Bot...', 'info');

  await watcher.stop();
  await bridge.stop();
  rl.close();

  logBot('Debug Bot encerrado. Até mais! 👋', 'success');
  process.exit(0);
}

// ── Main Startup ────────────────────────────────────────────────────────────
async function main() {
  console.clear();
  console.log(BANNER);

  logBot(`Projeto: ${chalk.cyan(PROJECT_ROOT)}`, 'info');
  logBot(`Regras de análise: ${chalk.cyan(analyzer.getRules().length)}`, 'info');

  // Start WebSocket bridge
  try {
    await bridge.start();
    logBot(`WebSocket server ativo na porta ${chalk.cyan(CONFIG.wsPort)}`, 'success');
  } catch (err) {
    logBot(`Falha ao iniciar WebSocket: ${err.message}`, 'error');
  }

  // Setup bridge handlers
  setupBridgeHandlers();

  // Start file watcher
  watcher.on('source-change', handleSourceChange);
  watcher.on('log-entry', handleLogEntry);
  watcher.on('watcher-error', (data) => {
    logBot(`Erro no watcher (${data.type}): ${data.error?.message || data.error}`, 'error');
  });
  watcher.on('started', (data) => {
    logBot(`Monitorando: ${chalk.cyan(path.relative(PROJECT_ROOT, data.srcPath))}`, 'success');
    logBot(`Log file: ${chalk.cyan(path.relative(PROJECT_ROOT, data.logPath))}`, 'success');
  });

  watcher.start();

  // Setup readline for CLI
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.hex('#FF6600')('\n  🤖 debug-bot ► '),
  });

  console.log('');
  logBot('Debug Bot iniciado! Monitorando mudanças...', 'success');
  logBot(`Digite ${chalk.white.bold("'help'")} para ver comandos disponíveis.`, 'info');

  rl.prompt();

  rl.on('line', async (input) => {
    await handleCommand(input.trim().toLowerCase());
    if (!isProcessing) {
      rl.prompt();
    }
  });

  rl.on('close', () => {
    shutdown();
  });

  // Handle graceful shutdown
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// ── Run ─────────────────────────────────────────────────────────────────────
main().catch((err) => {
  console.error(chalk.red(`Fatal error: ${err.message}`));
  process.exit(1);
});
