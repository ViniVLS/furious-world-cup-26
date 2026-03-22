import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from './toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private readonly MAX_TOASTS = 3;
  private readonly DEFAULT_DURATION = 3500;

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  private show(message: string, type: ToastType, duration?: number): void {
    const toast: Toast = {
      id: this.generateId(),
      message,
      type,
      duration: duration ?? this.DEFAULT_DURATION,
      createdAt: new Date()
    };

    this.toasts.update(current => {
      let updated = [toast, ...current];
      if (updated.length > this.MAX_TOASTS) {
        updated = updated.slice(0, this.MAX_TOASTS);
      }
      return updated;
    });

    setTimeout(() => this.dismiss(toast.id), toast.duration);
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration ?? 4000);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration ?? 4500);
  }

  dismiss(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
