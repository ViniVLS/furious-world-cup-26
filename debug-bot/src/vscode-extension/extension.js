// =============================================================================
// extension.js — VS Code Extension for Furious Debug Bot
// Connects to the debug bot via WebSocket, provides inline diagnostics,
// code actions (apply/ignore fix), and real-time error highlighting.
// =============================================================================

const vscode = require('vscode');
const WebSocket = require('ws');

/** @type {WebSocket|null} */
let ws = null;

/** @type {vscode.DiagnosticCollection} */
let diagnosticCollection;

/** @type {vscode.StatusBarItem} */
let statusBarItem;

/** @type {Map<string, Array<{result: any, diagnostic: vscode.Diagnostic}>>} */
const activeSuggestions = new Map();

/** @type {vscode.TextEditorDecorationType} */
let errorDecorationType;

/** @type {vscode.TextEditorDecorationType} */
let warningDecorationType;

// ── Decoration Types ────────────────────────────────────────────────────────
function createDecorationTypes() {
  errorDecorationType = vscode.window.createTextEditorDecorationType({
    borderWidth: '0 0 2px 0',
    borderStyle: 'wavy',
    borderColor: '#FF4444',
    backgroundColor: 'rgba(255, 68, 68, 0.08)',
    after: {
      contentText: ' 🤖 fix available',
      color: '#FF6600',
      fontStyle: 'italic',
      fontSize: '11px',
    },
  });

  warningDecorationType = vscode.window.createTextEditorDecorationType({
    borderWidth: '0 0 2px 0',
    borderStyle: 'wavy',
    borderColor: '#FFA500',
    backgroundColor: 'rgba(255, 165, 0, 0.06)',
    after: {
      contentText: ' 🤖 suggestion',
      color: '#FFA500',
      fontStyle: 'italic',
      fontSize: '11px',
    },
  });
}

// ── WebSocket Connection ────────────────────────────────────────────────────
function connect() {
  const config = vscode.workspace.getConfiguration('debugBot');
  const port = config.get('wsPort', 9876);

  if (ws && ws.readyState === WebSocket.OPEN) {
    vscode.window.showInformationMessage('Debug Bot: Já conectado!');
    return;
  }

  ws = new WebSocket(`ws://localhost:${port}`);

  ws.on('open', () => {
    updateStatusBar('connected');
    vscode.window.showInformationMessage('🤖 Debug Bot: Conectado!');
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(message);
    } catch (err) {
      console.error('Debug Bot: Failed to parse message:', err);
    }
  });

  ws.on('close', () => {
    updateStatusBar('disconnected');
    ws = null;
  });

  ws.on('error', (err) => {
    updateStatusBar('error');
    vscode.window.showErrorMessage(
      `🤖 Debug Bot: Erro na conexão — ${err.message}. Certifique-se que 'npm run debug-bot' está rodando.`
    );
    ws = null;
  });
}

function disconnect() {
  if (ws) {
    ws.close();
    ws = null;
  }
  updateStatusBar('disconnected');
  clearAllDiagnostics();
  vscode.window.showInformationMessage('🤖 Debug Bot: Desconectado.');
}

// ── Message Handler ─────────────────────────────────────────────────────────
function handleMessage(message) {
  switch (message.type) {
    case 'fix-suggestion':
      handleFixSuggestion(message.payload);
      break;

    case 'error-detected':
      handleErrorDetected(message.payload);
      break;

    case 'fix-applied':
      handleFixApplied(message.payload);
      break;

    case 'fix-ignored':
      handleFixIgnored(message.payload);
      break;

    case 'pong':
      break;

    default:
      console.log('Debug Bot: Unknown message type:', message.type);
  }
}

// ── Fix Suggestion Handler ──────────────────────────────────────────────────
function handleFixSuggestion(result) {
  const filePath = result.filePath;
  const uri = vscode.Uri.file(filePath);
  const line = result.line - 1; // VS Code is 0-based

  // Create diagnostic
  const range = new vscode.Range(line, 0, line, 1000);
  const severity =
    result.severity === 'error'
      ? vscode.DiagnosticSeverity.Error
      : result.severity === 'warning'
      ? vscode.DiagnosticSeverity.Warning
      : vscode.DiagnosticSeverity.Information;

  const diagnostic = new vscode.Diagnostic(range, `🤖 ${result.explanation}`, severity);
  diagnostic.source = 'Debug Bot';
  diagnostic.code = result.ruleId;

  // Store the suggestion
  if (!activeSuggestions.has(filePath)) {
    activeSuggestions.set(filePath, []);
  }
  activeSuggestions.get(filePath).push({ result, diagnostic });

  // Update diagnostics
  updateDiagnosticsForFile(uri);

  // Update decorations
  updateDecorationsForFile(filePath);

  // Update status bar
  const totalIssues = getTotalIssueCount();
  updateStatusBar('connected', totalIssues);
}

// ── Error Detected Handler ──────────────────────────────────────────────────
function handleErrorDetected(logEntry) {
  // Show notification for critical errors
  if (logEntry.level === 'ERROR') {
    vscode.window
      .showErrorMessage(
        `🤖 [${logEntry.service}] ${logEntry.message}`,
        'Ver Detalhes'
      )
      .then((action) => {
        if (action === 'Ver Detalhes') {
          showOutputLog(logEntry);
        }
      });
  }
}

// ── Fix Applied Handler ─────────────────────────────────────────────────────
function handleFixApplied(fixResult) {
  const filePath = fixResult.filePath;

  // Remove the suggestion
  if (activeSuggestions.has(filePath)) {
    const suggestions = activeSuggestions.get(filePath).filter(
      (s) => !(s.result.line === fixResult.line && s.result.ruleId === fixResult.ruleId)
    );
    if (suggestions.length > 0) {
      activeSuggestions.set(filePath, suggestions);
    } else {
      activeSuggestions.delete(filePath);
    }
  }

  // Update diagnostics and decorations
  updateDiagnosticsForFile(vscode.Uri.file(filePath));
  updateDecorationsForFile(filePath);
  updateStatusBar('connected', getTotalIssueCount());

  vscode.window.showInformationMessage(`🤖 Correção aplicada: ${fixResult.description}`);
}

// ── Fix Ignored Handler ─────────────────────────────────────────────────────
function handleFixIgnored(details) {
  const filePath = details.filePath;

  if (activeSuggestions.has(filePath)) {
    const suggestions = activeSuggestions.get(filePath).filter(
      (s) => !(s.result.line === details.line && s.result.ruleId === details.ruleId)
    );
    if (suggestions.length > 0) {
      activeSuggestions.set(filePath, suggestions);
    } else {
      activeSuggestions.delete(filePath);
    }
  }

  updateDiagnosticsForFile(vscode.Uri.file(filePath));
  updateDecorationsForFile(filePath);
  updateStatusBar('connected', getTotalIssueCount());
}

// ── Diagnostics ─────────────────────────────────────────────────────────────
function updateDiagnosticsForFile(uri) {
  const filePath = uri.fsPath;
  const suggestions = activeSuggestions.get(filePath) || [];
  const diagnostics = suggestions.map((s) => s.diagnostic);
  diagnosticCollection.set(uri, diagnostics);
}

function clearAllDiagnostics() {
  diagnosticCollection.clear();
  activeSuggestions.clear();
}

// ── Decorations ─────────────────────────────────────────────────────────────
function updateDecorationsForFile(filePath) {
  const config = vscode.workspace.getConfiguration('debugBot');
  if (!config.get('showInlineHints', true)) return;

  const editor = vscode.window.visibleTextEditors.find(
    (e) => e.document.uri.fsPath === filePath
  );
  if (!editor) return;

  const suggestions = activeSuggestions.get(filePath) || [];

  const errorDecorations = [];
  const warningDecorations = [];

  for (const { result } of suggestions) {
    const line = result.line - 1;
    if (line < 0 || line >= editor.document.lineCount) continue;

    const range = new vscode.Range(line, 0, line, editor.document.lineAt(line).text.length);
    const decoration = {
      range,
      hoverMessage: new vscode.MarkdownString(
        `### 🤖 Debug Bot\n\n` +
          `**${result.ruleName}** (${result.severity})\n\n` +
          `**Código atual:**\n\`\`\`typescript\n${result.currentCode}\n\`\`\`\n\n` +
          `**Sugestão:**\n\`\`\`typescript\n${result.suggestedFix}\n\`\`\`\n\n` +
          `${result.explanation}`
      ),
    };

    if (result.severity === 'error') {
      errorDecorations.push(decoration);
    } else {
      warningDecorations.push(decoration);
    }
  }

  editor.setDecorations(errorDecorationType, errorDecorations);
  editor.setDecorations(warningDecorationType, warningDecorations);
}

// ── Code Action Provider ────────────────────────────────────────────────────
class DebugBotCodeActionProvider {
  provideCodeActions(document, range) {
    const filePath = document.uri.fsPath;
    const suggestions = activeSuggestions.get(filePath) || [];
    const actions = [];

    for (const { result } of suggestions) {
      const line = result.line - 1;
      if (line < range.start.line || line > range.end.line) continue;

      // Apply fix action
      const applyAction = new vscode.CodeAction(
        `🤖 Aplicar correção: ${result.ruleName}`,
        vscode.CodeActionKind.QuickFix
      );
      applyAction.command = {
        command: 'debugBot.applyFix',
        title: 'Aplicar Correção',
        arguments: [result],
      };
      applyAction.isPreferred = true;
      actions.push(applyAction);

      // Ignore action
      const ignoreAction = new vscode.CodeAction(
        `🤖 Ignorar: ${result.ruleName}`,
        vscode.CodeActionKind.QuickFix
      );
      ignoreAction.command = {
        command: 'debugBot.ignoreFix',
        title: 'Ignorar',
        arguments: [result],
      };
      actions.push(ignoreAction);
    }

    return actions;
  }
}

// ── Status Bar ──────────────────────────────────────────────────────────────
function updateStatusBar(status, issueCount = 0) {
  if (!statusBarItem) return;

  switch (status) {
    case 'connected':
      statusBarItem.text = issueCount > 0
        ? `$(bug) Debug Bot (${issueCount})`
        : '$(bug) Debug Bot ✔';
      statusBarItem.color = issueCount > 0 ? '#FFA500' : '#4FC3F7';
      statusBarItem.tooltip = issueCount > 0
        ? `Debug Bot: ${issueCount} issue(s) detectada(s)`
        : 'Debug Bot: Conectado, sem issues';
      break;
    case 'disconnected':
      statusBarItem.text = '$(bug) Debug Bot ✖';
      statusBarItem.color = '#B0BEC5';
      statusBarItem.tooltip = 'Debug Bot: Desconectado';
      break;
    case 'error':
      statusBarItem.text = '$(bug) Debug Bot ⚠';
      statusBarItem.color = '#FF4444';
      statusBarItem.tooltip = 'Debug Bot: Erro na conexão';
      break;
  }
}

// ── Output Channel ──────────────────────────────────────────────────────────
let outputChannel;

function showOutputLog(logEntry) {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('Furious Debug Bot');
  }
  outputChannel.appendLine(`\n[${logEntry.level}] [${logEntry.service}] ${logEntry.message}`);
  if (logEntry.data) {
    outputChannel.appendLine(`Data: ${JSON.stringify(logEntry.data, null, 2)}`);
  }
  outputChannel.show();
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function getTotalIssueCount() {
  let count = 0;
  for (const suggestions of activeSuggestions.values()) {
    count += suggestions.length;
  }
  return count;
}

function sendMessage(type, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  } else {
    vscode.window.showWarningMessage(
      '🤖 Debug Bot: Não conectado. Execute "Debug Bot: Conectar" primeiro.'
    );
  }
}

// ── Activation ──────────────────────────────────────────────────────────────
function activate(context) {
  console.log('Furious Debug Bot extension is now active');

  // Create diagnostics collection
  diagnosticCollection = vscode.languages.createDiagnosticCollection('debugBot');
  context.subscriptions.push(diagnosticCollection);

  // Create decoration types
  createDecorationTypes();

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'debugBot.showPanel';
  updateStatusBar('disconnected');
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register code action provider
  const codeActionProvider = new DebugBotCodeActionProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { language: 'typescript', scheme: 'file' },
      codeActionProvider,
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('debugBot.connect', connect),
    vscode.commands.registerCommand('debugBot.disconnect', disconnect),
    vscode.commands.registerCommand('debugBot.showPanel', () => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        connect();
      }
      if (outputChannel) outputChannel.show();
    }),
    vscode.commands.registerCommand('debugBot.applyFix', (result) => {
      sendMessage('apply-fix', {
        filePath: result.filePath,
        line: result.line,
        ruleId: result.ruleId,
      });
    }),
    vscode.commands.registerCommand('debugBot.ignoreFix', (result) => {
      sendMessage('ignore', {
        filePath: result.filePath,
        line: result.line,
        ruleId: result.ruleId,
      });
    }),
    vscode.commands.registerCommand('debugBot.scan', () => {
      sendMessage('get-suggestions', {});
    })
  );

  // Update decorations when editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        updateDecorationsForFile(editor.document.uri.fsPath);
      }
    })
  );

  // Auto-connect if configured
  const config = vscode.workspace.getConfiguration('debugBot');
  if (config.get('autoConnect', true)) {
    setTimeout(connect, 2000);
  }
}

function deactivate() {
  disconnect();
  if (errorDecorationType) errorDecorationType.dispose();
  if (warningDecorationType) warningDecorationType.dispose();
  if (outputChannel) outputChannel.dispose();
}

module.exports = { activate, deactivate };
