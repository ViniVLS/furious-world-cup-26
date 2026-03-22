import { Injectable, signal, computed, effect } from '@angular/core';
import { Subject } from 'rxjs';
import { DebugConfig, DebugEntry, DebugLevel, DebugCategory, DEBUG_CONFIG } from './debug.config';
import {
  generateId,
  formatTimestamp,
  getLevelColor,
  getCategoryIcon,
  truncate,
  deepClone,
} from './debug.utils';

@Injectable({ providedIn: 'root' })
export class DebugService {
  private config: DebugConfig;
  private timerMarks: Map<string, number> = new Map();

  readonly entries = signal<DebugEntry[]>([]);
  readonly activeFilters = signal<DebugLevel[]>([...this.getDefaultLevels()]);
  readonly searchText = signal('');
  readonly activeCategories = signal<Set<DebugCategory>>(new Set<DebugCategory>());
  readonly isMinimized = signal(false);
  readonly newErrorCount = signal(0);
  readonly totalCount = signal(0);

  private stream$ = new Subject<DebugEntry>();
  readonly stream = this.stream$.asObservable();

  readonly filteredEntries = computed(() => {
    const all = this.entries();
    const filters = this.activeFilters();
    const text = this.searchText().toLowerCase();
    const cats = this.activeCategories();

    return all.filter(entry => {
      if (!filters.includes(entry.level)) return false;
      if (cats.size > 0 && !cats.has(entry.category)) return false;
      if (text) {
        const searchable = `${entry.service} ${entry.method || ''} ${entry.message}`.toLowerCase();
        if (!searchable.includes(text)) return false;
      }
      return true;
    });
  });

  constructor() {
    this.config = this.loadConfig();

    effect(() => {
      const count = this.entries().length;
      const max = this.config.maxHistory;
      if (count > max) {
        this.entries.update(list => list.slice(-max));
      }
    });
  }

  private loadConfig(): DebugConfig {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return { enabled: false } as DebugConfig;
    }
    try {
      const stored = localStorage.getItem('furia-debug-config');
      if (stored) {
        return { ...DEBUG_CONFIG, ...JSON.parse(stored) };
      }
    } catch {}
    return DEBUG_CONFIG;
  }

  private getDefaultLevels(): DebugLevel[] {
    return ['ERROR', 'WARN'];
  }

  private emit(entry: DebugEntry): void {
    this.entries.update(list => [...list, entry]);
    this.totalCount.update(n => n + 1);

    if (entry.level === 'ERROR') {
      this.newErrorCount.update(n => n + 1);
    }

    this.stream$.next(entry);

    if (entry.level === 'ERROR') {
      const prefix = `[🔴 ${entry.level}] [${entry.service}]`;
      const msg = entry.method ? `[${entry.method}] ${entry.message}` : entry.message;
      const data = entry.data ? ` | Data: ${JSON.stringify(entry.data)}` : '';
      console.error(`${prefix} ${msg}${data}`);
    } else if (entry.level === 'WARN') {
      const prefix = `[🟡 ${entry.level}] [${entry.service}]`;
      const msg = entry.method ? `[${entry.method}] ${entry.message}` : entry.message;
      console.warn(`${prefix} ${msg}`);
    } else if (entry.level === 'INFO') {
      const prefix = `[🔵 ${entry.level}] [${entry.service}]`;
      const msg = entry.method ? `[${entry.method}] ${entry.message}` : entry.message;
      console.info(`${prefix} ${msg}`);
    } else {
      const prefix = `[⚪ ${entry.level}] [${entry.service}]`;
      const msg = entry.method ? `[${entry.method}] ${entry.message}` : entry.message;
      console.log(`${prefix} ${msg}`);
    }
  }

  private log(
    level: DebugLevel,
    category: DebugCategory,
    service: string,
    message: string,
    data?: unknown,
    method?: string,
    durationMs?: number
  ): void {
    if (!this.isEnabled(service, category, level)) return;
    const entry: DebugEntry = {
      id: generateId(),
      timestamp: new Date(),
      level,
      category,
      service,
      method,
      message,
      data: data !== undefined ? deepClone(data) : undefined,
      durationMs,
    };
    this.emit(entry);
  }

  private isEnabled(service: string, category: DebugCategory, level: DebugLevel): boolean {
    if (!this.config.enabled) return false;
    if (this.config.levels && !this.config.levels[level]) return false;
    if (this.config.categories && !this.config.categories[category]) return false;
    if (this.config.services && this.config.services[service] === false) return false;
    return true;
  }

  debug(category: DebugCategory, service: string, message: string, data?: unknown, method?: string): void {
    this.log('DEBUG', category, service, message, data, method);
  }

  info(category: DebugCategory, service: string, message: string, data?: unknown, method?: string): void {
    this.log('INFO', category, service, message, data, method);
  }

  warn(category: DebugCategory, service: string, message: string, data?: unknown, method?: string): void {
    this.log('WARN', category, service, message, data, method);
  }

  error(category: DebugCategory, service: string, message: string, data?: unknown, method?: string): void {
    this.log('ERROR', category, service, message, data, method);
  }

  logMethodEntry(service: string, method: string, params?: unknown): void {
    this.info('METHOD', service, `▶ ENTRY`, params, method);
  }

  logMethodExit(service: string, method: string, result?: unknown, durationMs?: number): void {
    const msg = durationMs !== undefined ? `◀ EXIT (${durationMs}ms)` : `◀ EXIT`;
    this.info('METHOD', service, msg, result, method);
  }

  logMethodError(service: string, method: string, error: unknown, durationMs?: number): void {
    const msg = durationMs !== undefined ? `✖ ERROR (${durationMs}ms)` : `✖ ERROR`;
    this.error('METHOD', service, msg, error, method);
  }

  logStateChange(service: string, signalName: string, before: unknown, after: unknown): void {
    this.debug('STATE', service, `State changed: ${signalName}`, { before, after }, 'signal-update');
  }

  logEconomy(service: string, action: 'ADD' | 'DEDUCT' | 'VAULT', amount: number, before: number, after: number): void {
    const msg = action === 'ADD'
      ? `+${amount} coins (${before} → ${after})`
      : action === 'DEDUCT'
      ? `-${amount} coins (${before} → ${after})`
      : `VAULT transfer +${amount} (${before} → ${after})`;
    this.info('ECONOMY', service, msg, { action, amount, before, after });
  }

  logAudit(service: string, action: string, details?: unknown): void {
    this.info('AUDIT', service, `[AUDIT] ${action}`, details);
  }

  logLifecycle(component: string, hook: string): void {
    this.debug('LIFECYCLE', component, `Hook: ${hook}`, undefined, hook);
  }

  logNavigation(from: string, to: string, extras?: unknown): void {
    this.info('NAVIGATION', 'Router', `${from} → ${to}`, extras);
  }

  logAudio(service: string, event: string, extras?: unknown): void {
    this.info('AUDIO', service, event, extras);
  }

  logPush(service: string, event: string, extras?: unknown): void {
    this.info('PUSH', service, event, extras);
  }

  startTimer(label: string): number {
    const mark = performance.now();
    this.timerMarks.set(label, mark);
    return mark;
  }

  endTimer(label: string): number | undefined {
    const start = this.timerMarks.get(label);
    if (start === undefined) return undefined;
    const duration = Math.round(performance.now() - start);
    this.timerMarks.delete(label);
    return duration;
  }

  clear(): void {
    this.entries.set([]);
    this.totalCount.set(0);
    this.newErrorCount.set(0);
    this.info('LIFECYCLE', 'DebugService', 'History cleared');
  }

  setFilter(levels: DebugLevel[]): void {
    this.activeFilters.set(levels);
  }

  toggleLevel(level: DebugLevel): void {
    this.activeFilters.update(current => {
      if (current.includes(level)) {
        return current.filter(l => l !== level);
      }
      return [...current, level];
    });
  }

  setSearch(text: string): void {
    this.searchText.set(text);
  }

  setCategory(category: DebugCategory, active: boolean): void {
    this.activeCategories.update(set => {
      const next = new Set(set);
      if (active) {
        next.add(category);
      } else {
        next.delete(category);
      }
      return next;
    });
  }

  toggleMinimize(): void {
    this.isMinimized.update(v => !v);
  }

  dismissErrors(): void {
    this.newErrorCount.set(0);
  }

  exportToJSON(): void {
    const data = JSON.stringify(this.entries(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `furious-debug-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.info('LIFECYCLE', 'DebugService', `Exported ${this.entries().length} entries to JSON`);
  }

  getSummary(): { total: number; errors: number; warns: number; services: string[] } {
    const all = this.entries();
    const errors = all.filter(e => e.level === 'ERROR').length;
    const warns = all.filter(e => e.level === 'WARN').length;
    const services = [...new Set(all.map(e => e.service))];
    return { total: all.length, errors, warns, services };
  }
}
