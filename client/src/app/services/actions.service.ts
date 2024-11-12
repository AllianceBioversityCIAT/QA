import { Injectable, signal } from '@angular/core';
import { GlobalAlert } from '../interfaces/global-alert.interface';
import { ToastMessage } from '../interfaces/toast-message.interface';

@Injectable({
  providedIn: 'root'
})
export class ActionsService {
  toastMessage = signal<ToastMessage>({ severity: 'info', summary: '', detail: '' });
  globalAlertsStatus = signal<GlobalAlert[]>([]);

  showToast(toastMessage: ToastMessage) {
    this.toastMessage.set(toastMessage);
  }

  showGlobalAlert(globalAlert: GlobalAlert) {
    this.globalAlertsStatus.update(prev => [...prev, globalAlert]);
  }

  hideGlobalAlert(index: number) {
    this.globalAlertsStatus.update(prev => prev.filter((_, i) => i !== index));
  }
}
