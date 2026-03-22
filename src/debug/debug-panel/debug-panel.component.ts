import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DebugService } from '../debug.service';
import { DebugEntry, DebugLevel, DebugCategory } from '../debug.config';
import { formatTimestamp, getLevelColor, getCategoryIcon } from '../debug.utils';

@Component({
  selector: 'app-debug-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './debug-panel.component.html',
  styleUrl: './debug-panel.component.css',
})
export class DebugPanelComponent implements OnInit, OnDestroy {
  readonly debug = inject(DebugService);

  readonly levels: DebugLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  readonly categories: DebugCategory[] = [
    'LIFECYCLE', 'METHOD', 'STATE', 'ECONOMY', 'AUDIT',
    'NAVIGATION', 'AUDIO', 'PUSH', 'ERROR', 'WARN'
  ];

  expandedIds = signal<Set<string>>(new Set());
  selectedEntry = signal<DebugEntry | null>(null);
  isDragging = signal(false);
  dragOffset = signal({ x: 0, y: 0 });
  panelPos = signal({ x: 0, y: 0 });

  readonly levelColors: Record<DebugLevel, string> = {
    DEBUG: '#B0BEC5',
    INFO: '#4FC3F7',
    WARN: '#FFA500',
    ERROR: '#FF4444',
  };

  readonly levelIcons: Record<DebugLevel, string> = {
    DEBUG: '⚪',
    INFO: '🔵',
    WARN: '🟡',
    ERROR: '🔴',
  };

  private sub!: Subscription;

  ngOnInit() {
    this.sub = this.debug.stream.subscribe(entry => {
      if (entry.level === 'ERROR' || entry.level === 'WARN') {
        if (this.debug.isMinimized()) {
          this.debug.toggleMinimize();
        }
      }
    });
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.panelPos.set({ x: w - 460, y: h - 410 });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  isLevelActive(level: DebugLevel): boolean {
    return this.debug.activeFilters().includes(level);
  }

  isCategoryActive(cat: DebugCategory): boolean {
    return this.debug.activeCategories().has(cat);
  }

  toggleLevel(level: DebugLevel) {
    this.debug.toggleLevel(level);
  }

  toggleCategory(cat: DebugCategory) {
    this.debug.setCategory(cat, !this.isCategoryActive(cat));
  }

  setSearch(text: string) {
    this.debug.setSearch(text);
  }

  clear() {
    this.debug.clear();
    this.selectedEntry.set(null);
  }

  export() {
    this.debug.exportToJSON();
  }

  toggleExpand(id: string) {
    this.expandedIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  selectEntry(entry: DebugEntry) {
    if (this.selectedEntry()?.id === entry.id) {
      this.selectedEntry.set(null);
    } else {
      this.selectedEntry.set(entry);
      this.toggleExpand(entry.id);
    }
  }

  formatTime(entry: DebugEntry): string {
    return formatTimestamp(entry.timestamp);
  }

  getColor(entry: DebugEntry): string {
    return getLevelColor(entry.level);
  }

  getIcon(entry: DebugEntry): string {
    return getCategoryIcon(entry.category);
  }

  trackByEntry(_: number, entry: DebugEntry): string {
    return entry.id;
  }

  getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      LIFECYCLE: 'LC',
      METHOD: 'MTH',
      STATE: 'STA',
      ECONOMY: 'ECO',
      AUDIT: 'AUD',
      NAVIGATION: 'NAV',
      AUDIO: 'AUD',
      PUSH: 'PUSH',
      ERROR: 'ERR',
      WARN: 'WARN',
    };
    return labels[cat] || cat;
  }

  dismissErrors() {
    this.debug.dismissErrors();
  }

  onDragStart(event: MouseEvent) {
    event.preventDefault();
    this.isDragging.set(true);
    this.dragOffset.set({
      x: event.clientX - this.panelPos().x,
      y: event.clientY - this.panelPos().y,
    });
  }

  onDragMove(event: MouseEvent) {
    if (!this.isDragging()) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = Math.max(0, Math.min(w - 460, event.clientX - this.dragOffset().x));
    const y = Math.max(0, Math.min(h - 50, event.clientY - this.dragOffset().y));
    this.panelPos.set({ x, y });
  }

  onDragEnd() {
    this.isDragging.set(false);
  }
}
