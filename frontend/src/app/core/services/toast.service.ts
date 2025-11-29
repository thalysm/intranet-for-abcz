import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  constructor() {}

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private addToast(toast: Omit<Toast, 'id'>): void {
    const newToast: Toast = {
      ...toast,
      id: this.generateId()
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    // Auto remove toast
    const duration = toast.duration || (toast.type === 'error' ? 7000 : 5000);
    setTimeout(() => {
      this.removeToast(newToast.id);
    }, duration);
  }

  success(message: string, duration?: number): void {
    this.addToast({ type: 'success', message, duration });
  }

  error(message: string, duration?: number): void {
    this.addToast({ type: 'error', message, duration });
  }

  warning(message: string, duration?: number): void {
    this.addToast({ type: 'warning', message, duration });
  }

  info(message: string, duration?: number): void {
    this.addToast({ type: 'info', message, duration });
  }

  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clearAll(): void {
    this.toastsSubject.next([]);
  }
}