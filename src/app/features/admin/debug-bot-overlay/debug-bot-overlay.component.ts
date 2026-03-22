// =============================================================================
// debug-bot-overlay.component.ts — Angular Frontend Integration
// Connects to the debug bot via WebSocket and displays error/fix suggestions
// as an overlay within the admin panel.
// =============================================================================

import { Component, OnInit, OnDestroy, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface BotSuggestion {
  ruleId: string;
  severity: 'error' | 'warning' | 'suggestion';
  filePath: string;
  line: number;
  currentCode: string;
  suggestedFix: string;
  explanation: string;
  ruleName: string;
}

interface BotLogEntry {
  id: string;
  timestamp: string;
  level: string;
  service: string;
  message: string;
}

@Component({
  selector: 'app-debug-bot-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debug-bot-overlay.component.html',
  styleUrl: './debug-bot-overlay.component.css',
})
export class DebugBotOverlayComponent implements OnInit, OnDestroy {
  private ws: WebSocket | null = null;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly isConnected = signal(false);
  readonly isMinimized = signal(false);
  readonly isClosed = signal(true);
  readonly suggestions = signal<BotSuggestion[]>([]);
  readonly recentLogs = signal<BotLogEntry[]>([]);
  readonly statusMessage = signal('Desconectado');
  readonly selectedSuggestion = signal<BotSuggestion | null>(null);

  readonly errorCount = computed(() => this.suggestions().filter((s) => s.severity === 'error').length);
  readonly warningCount = computed(() => this.suggestions().filter((s) => s.severity === 'warning').length);

  ngOnInit() {
    // Don't auto-connect — user must open the panel first
  }

  ngOnDestroy() {
    this.disconnect();
  }

  connect() {
    if (!this.isBrowser) return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket('ws://localhost:9876');
      this.statusMessage.set('Conectando...');

      this.ws.onopen = () => {
        this.isConnected.set(true);
        this.statusMessage.set('Conectado');
        // Request existing suggestions
        this.ws?.send(JSON.stringify({ type: 'get-suggestions' }));
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch { /* ignore parse errors */ }
      };

      this.ws.onclose = () => {
        this.isConnected.set(false);
        this.statusMessage.set('Desconectado');
        this.ws = null;
      };

      this.ws.onerror = () => {
        this.isConnected.set(false);
        this.statusMessage.set('Erro — Debug Bot não está rodando');
        this.ws = null;
      };
    } catch {
      this.statusMessage.set('Erro ao conectar');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected.set(false);
    this.statusMessage.set('Desconectado');
  }

  private handleMessage(message: { type: string; payload: any }) {
    switch (message.type) {
      case 'fix-suggestion':
        this.suggestions.update((list) => [...list, message.payload]);
        break;

      case 'all-suggestions':
        this.suggestions.set(message.payload || []);
        break;

      case 'error-detected':
        this.recentLogs.update((logs) => [message.payload, ...logs].slice(0, 50));
        break;

      case 'fix-applied':
        this.suggestions.update((list) =>
          list.filter(
            (s) =>
              !(
                s.filePath === message.payload.filePath &&
                s.line === message.payload.line &&
                s.ruleId === message.payload.ruleId
              )
          )
        );
        if (this.selectedSuggestion()) {
          const sel = this.selectedSuggestion()!;
          if (sel.filePath === message.payload.filePath && sel.line === message.payload.line) {
            this.selectedSuggestion.set(null);
          }
        }
        break;

      case 'fix-ignored':
        this.suggestions.update((list) =>
          list.filter(
            (s) =>
              !(
                s.filePath === message.payload.filePath &&
                s.line === message.payload.line &&
                s.ruleId === message.payload.ruleId
              )
          )
        );
        break;
    }
  }

  applyFix(suggestion: BotSuggestion) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(
      JSON.stringify({
        type: 'apply-fix',
        payload: {
          filePath: suggestion.filePath,
          line: suggestion.line,
          ruleId: suggestion.ruleId,
        },
      })
    );
  }

  ignoreFix(suggestion: BotSuggestion) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(
      JSON.stringify({
        type: 'ignore',
        payload: {
          filePath: suggestion.filePath,
          line: suggestion.line,
          ruleId: suggestion.ruleId,
        },
      })
    );
  }

  selectSuggestion(suggestion: BotSuggestion) {
    if (this.selectedSuggestion() === suggestion) {
      this.selectedSuggestion.set(null);
    } else {
      this.selectedSuggestion.set(suggestion);
    }
  }

  toggleMinimize() {
    this.isMinimized.update((v) => !v);
  }

  openPanel() {
    this.isClosed.set(false);
    this.connect();
  }

  closePanel() {
    this.isClosed.set(true);
    this.disconnect();
  }

  getFileName(filePath: string): string {
    return filePath.split(/[\\/]/).pop() || filePath;
  }

  getSeverityIcon(severity: string): string {
    return severity === 'error' ? '🔴' : severity === 'warning' ? '🟡' : '🔵';
  }

  trackBySuggestion(_: number, item: BotSuggestion): string {
    return `${item.filePath}:${item.line}:${item.ruleId}`;
  }

  trackByLog(_: number, item: BotLogEntry): string {
    return item.id;
  }
}
