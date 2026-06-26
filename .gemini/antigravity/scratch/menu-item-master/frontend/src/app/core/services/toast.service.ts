import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  public toasts = this.toasts$.asObservable();
  private counter = 0;

  show(message: string, type: 'success' | 'danger' | 'warning' = 'success', duration = 6000) {
    const id = ++this.counter;
    const current = this.toasts$.value;
    this.toasts$.next([...current, { id, message, type }]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  showSuccess(message: string) {
    this.show(message, 'success');
  }

  showError(message: string) {
    this.show(message, 'danger');
  }

  showWarning(message: string) {
    this.show(message, 'warning');
  }

  remove(id: number) {
    const filtered = this.toasts$.value.filter(t => t.id !== id);
    this.toasts$.next(filtered);
  }
}
