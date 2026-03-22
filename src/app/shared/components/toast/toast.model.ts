export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: Date;
}

export interface ToastConfig {
  maxToasts: number;
  defaultDuration: number;
}
