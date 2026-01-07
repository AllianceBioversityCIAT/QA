import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';
import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;
  let routerEventsSubject: Subject<any>;

  beforeEach(() => {
    routerEventsSubject = new Subject();

    TestBed.configureTestingModule({
      providers: [
        AlertService,
        {
          provide: Router,
          useValue: {
            events: routerEventsSubject.asObservable()
          }
        }
      ]
    });
    service = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAlert', () => {
    it('should return an Observable', (done) => {
      const observable = service.getAlert();
      expect(observable).toBeDefined();

      observable.subscribe(value => {
        expect(value).toEqual({ type: 'success', text: 'Test message' });
        done();
      });

      service.success('Test message');
    });
  });

  describe('success', () => {
    it('should send success alert', (done) => {
      service.getAlert().subscribe(alert => {
        if (alert) {
          expect(alert.type).toBe('success');
          expect(alert.text).toBe('Success message');
          done();
        }
      });

      service.success('Success message');
    });

    it('should set keepAfterRouteChange flag', () => {
      service.success('Message', true);
      expect(service.keepAfterRouteChange).toBe(true);
    });

    it('should auto clear after 5 seconds', fakeAsync(() => {
      let alertValue: any;
      service.getAlert().subscribe(alert => {
        alertValue = alert;
      });

      service.success('Message');
      expect(alertValue).toBeDefined();

      tick(5000);
      expect(alertValue).toBeNull();
    }));
  });

  describe('error', () => {
    it('should send error alert', (done) => {
      service.getAlert().subscribe(alert => {
        if (alert) {
          expect(alert.type).toBe('error');
          expect(alert.text).toBe('Error message');
          done();
        }
      });

      service.error('Error message');
    });

    it('should set keepAfterRouteChange flag', () => {
      service.error('Message', true);
      expect(service.keepAfterRouteChange).toBe(true);
    });

    it('should auto clear after 5 seconds', fakeAsync(() => {
      let alertValue: any;
      service.getAlert().subscribe(alert => {
        alertValue = alert;
      });

      service.error('Message');
      expect(alertValue).toBeDefined();

      tick(5000);
      expect(alertValue).toBeNull();
    }));
  });

  describe('clear', () => {
    it('should clear alert by sending null', (done) => {
      let callCount = 0;
      service.getAlert().subscribe(alert => {
        callCount++;
        if (callCount === 1) {
          expect(alert.text).toBe('Test');
        } else if (callCount === 2) {
          expect(alert).toBeNull();
          done();
        }
      });

      service.success('Test', true);
      service.clear();
    });
  });

  describe('NavigationStart handling', () => {
    it('should clear alert on navigation when keepAfterRouteChange is false', (done) => {
      service.keepAfterRouteChange = false;

      service.getAlert().subscribe(alert => {
        if (alert === null) {
          done();
        }
      });

      routerEventsSubject.next(new NavigationStart(1, '/test'));
    });

    it('should not clear alert on navigation when keepAfterRouteChange is true', () => {
      let cleared = false;
      service.keepAfterRouteChange = true;

      service.getAlert().subscribe(alert => {
        if (alert === null) {
          cleared = true;
        }
      });

      routerEventsSubject.next(new NavigationStart(1, '/test'));
      expect(cleared).toBe(false);
      expect(service.keepAfterRouteChange).toBe(false);
    });

    it('should reset keepAfterRouteChange flag after one navigation', () => {
      service.keepAfterRouteChange = true;

      routerEventsSubject.next(new NavigationStart(1, '/test'));
      expect(service.keepAfterRouteChange).toBe(false);
    });
  });
});
