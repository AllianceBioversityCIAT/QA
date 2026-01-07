import { TestBed } from '@angular/core/testing';
import { ActionsService } from './actions.service';
import { GlobalAlert } from '../interfaces/global-alert.interface';
import { ToastMessage } from '../interfaces/toast-message.interface';

describe('ActionsService', () => {
  let service: ActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize toastMessage signal with default value', () => {
    const defaultValue = service.toastMessage();
    expect(defaultValue).toEqual({ severity: 'info', summary: '', detail: '' });
  });

  it('should initialize globalAlertsStatus signal with empty array', () => {
    const defaultValue = service.globalAlertsStatus();
    expect(defaultValue).toEqual([]);
  });

  describe('showToast', () => {
    it('should update toastMessage signal', () => {
      const newMessage: ToastMessage = {
        severity: 'success',
        summary: 'Success',
        detail: 'Operation completed'
      };

      service.showToast(newMessage);

      expect(service.toastMessage()).toEqual(newMessage);
    });

    it('should handle different severity levels', () => {
      const errorMessage: ToastMessage = {
        severity: 'danger',
        summary: 'Error',
        detail: 'Something went wrong'
      };

      service.showToast(errorMessage);

      expect(service.toastMessage().severity).toBe('danger');
    });
  });

  describe('showGlobalAlert', () => {
    it('should add alert to globalAlertsStatus signal', () => {
      const alert: GlobalAlert = {
        severity: 'warning',
        summary: 'Test',
        detail: 'Test alert'
      };

      service.showGlobalAlert(alert);

      const alerts = service.globalAlertsStatus();
      expect(alerts.length).toBe(1);
      expect(alerts[0]).toEqual(alert);
    });

    it('should add multiple alerts', () => {
      const alert1: GlobalAlert = { severity: 'info', summary: 'Alert 1', detail: 'Detail 1' };
      const alert2: GlobalAlert = { severity: 'danger', summary: 'Alert 2', detail: 'Detail 2' };

      service.showGlobalAlert(alert1);
      service.showGlobalAlert(alert2);

      const alerts = service.globalAlertsStatus();
      expect(alerts.length).toBe(2);
      expect(alerts[0]).toEqual(alert1);
      expect(alerts[1]).toEqual(alert2);
    });
  });

  describe('hideGlobalAlert', () => {
    it('should remove alert at specific index', () => {
      const alert1: GlobalAlert = { severity: 'info', summary: 'Alert 1', detail: 'Detail 1' };
      const alert2: GlobalAlert = { severity: 'danger', summary: 'Alert 2', detail: 'Detail 2' };
      const alert3: GlobalAlert = { severity: 'warning', summary: 'Alert 3', detail: 'Detail 3' };

      service.showGlobalAlert(alert1);
      service.showGlobalAlert(alert2);
      service.showGlobalAlert(alert3);

      service.hideGlobalAlert(1);

      const alerts = service.globalAlertsStatus();
      expect(alerts.length).toBe(2);
      expect(alerts[0]).toEqual(alert1);
      expect(alerts[1]).toEqual(alert3);
    });

    it('should handle removing first alert', () => {
      const alert1: GlobalAlert = { severity: 'info', summary: 'Alert 1', detail: 'Detail 1' };
      const alert2: GlobalAlert = { severity: 'danger', summary: 'Alert 2', detail: 'Detail 2' };

      service.showGlobalAlert(alert1);
      service.showGlobalAlert(alert2);

      service.hideGlobalAlert(0);

      const alerts = service.globalAlertsStatus();
      expect(alerts.length).toBe(1);
      expect(alerts[0]).toEqual(alert2);
    });

    it('should handle removing last alert', () => {
      const alert1: GlobalAlert = { severity: 'info', summary: 'Alert 1', detail: 'Detail 1' };
      const alert2: GlobalAlert = { severity: 'danger', summary: 'Alert 2', detail: 'Detail 2' };

      service.showGlobalAlert(alert1);
      service.showGlobalAlert(alert2);

      service.hideGlobalAlert(1);

      const alerts = service.globalAlertsStatus();
      expect(alerts.length).toBe(1);
      expect(alerts[0]).toEqual(alert1);
    });
  });
});
