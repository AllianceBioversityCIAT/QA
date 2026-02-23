import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';
import clarity from '@microsoft/clarity';

import { ClarityService } from './clarity.service';
import { AuthenticationService } from './authentication.service';

jest.mock('@microsoft/clarity', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    consent: jest.fn(),
    setTag: jest.fn(),
    event: jest.fn(),
    upgrade: jest.fn(),
  },
}));

describe('ClarityService', () => {
  let service: ClarityService;
  let routerEvents$: Subject<any>;
  let mockAuthService: any;

  beforeEach(() => {
    routerEvents$ = new Subject();
    mockAuthService = {
      currentUser: of({ id: 1, name: 'Test', username: 'testuser', email: 'test@test.com', roles: [{ acronym: 'ADM' }] }),
      currentUserSubject: { value: null },
    };

    jest.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ClarityService,
        { provide: Router, useValue: { events: routerEvents$.asObservable(), url: '/', navigate: jest.fn() } },
        { provide: AuthenticationService, useValue: mockAuthService },
      ],
    });
    service = TestBed.inject(ClarityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('should initialize clarity and set up tracking', () => {
      service.init();
      expect(clarity.init).toHaveBeenCalled();
      expect(clarity.consent).toHaveBeenCalled();
    });

    it('should not initialize twice', () => {
      service.init();
      service.init();
      expect(clarity.init).toHaveBeenCalledTimes(1);
    });

    it('should handle error during initialization', () => {
      (clarity.init as jest.Mock).mockImplementationOnce(() => { throw new Error('fail'); });
      expect(() => service.init()).not.toThrow();
    });
  });

  describe('route tracking (after init)', () => {
    it('should track page view on NavigationEnd', () => {
      service.init();
      routerEvents$.next(new NavigationEnd(1, '/dashboard', '/dashboard'));
      expect(clarity.setTag).toHaveBeenCalledWith('page', '/dashboard');
    });

    it('should handle error in setTag during navigation', () => {
      (clarity.setTag as jest.Mock).mockImplementationOnce(() => { throw new Error('tag fail'); });
      service.init();
      routerEvents$.next(new NavigationEnd(1, '/test', '/test'));
      // Should not throw
    });
  });

  describe('trackEvent', () => {
    it('should track event without data', () => {
      service.trackEvent('button_click');
      expect(clarity.event).toHaveBeenCalledWith('button_click');
    });

    it('should track event with data', () => {
      service.trackEvent('form_submit', { field: 'email' });
      expect(clarity.event).toHaveBeenCalledWith('form_submit');
      expect(clarity.setTag).toHaveBeenCalledWith('field', '"email"');
    });

    it('should handle error in tracking event', () => {
      (clarity.event as jest.Mock).mockImplementationOnce(() => { throw new Error('fail'); });
      expect(() => service.trackEvent('crash')).not.toThrow();
    });
  });

  describe('setTags', () => {
    it('should set multiple tags', () => {
      service.setTags({ key1: 'val1', key2: 'val2' });
      expect(clarity.setTag).toHaveBeenCalledWith('key1', 'val1');
      expect(clarity.setTag).toHaveBeenCalledWith('key2', 'val2');
    });

    it('should handle error in setTags', () => {
      (clarity.setTag as jest.Mock).mockImplementationOnce(() => { throw new Error('fail'); });
      expect(() => service.setTags({ k: 'v' })).not.toThrow();
    });
  });

  describe('upgradeSession', () => {
    it('should call clarity.upgrade', () => {
      service.upgradeSession('important');
      expect(clarity.upgrade).toHaveBeenCalledWith('important');
    });

    it('should handle error', () => {
      (clarity.upgrade as jest.Mock).mockImplementationOnce(() => { throw new Error('fail'); });
      expect(() => service.upgradeSession('test')).not.toThrow();
    });
  });

  describe('setCookieConsent', () => {
    it('should call clarity.consent with true', () => {
      service.setCookieConsent(true);
      expect(clarity.consent).toHaveBeenCalledWith(true);
    });

    it('should call clarity.consent with false', () => {
      service.setCookieConsent(false);
      expect(clarity.consent).toHaveBeenCalledWith(false);
    });

    it('should handle error', () => {
      (clarity.consent as jest.Mock).mockImplementationOnce(() => { throw new Error('fail'); });
      expect(() => service.setCookieConsent(true)).not.toThrow();
    });
  });

  describe('updateUserInfo', () => {
    it('should call setUserInfo internally', () => {
      service.updateUserInfo();
      expect(clarity.setTag).toHaveBeenCalledWith('id', '1');
      expect(clarity.setTag).toHaveBeenCalledWith('user_name', 'Test');
    });
  });

  describe('setUserInfo with null user', () => {
    it('should not set tags when currentUser is null', () => {
      jest.clearAllMocks();
      mockAuthService.currentUser = of(null);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          ClarityService,
          { provide: Router, useValue: { events: of(), url: '/', navigate: jest.fn() } },
          { provide: AuthenticationService, useValue: mockAuthService },
        ],
      });
      const svc = TestBed.inject(ClarityService);
      jest.clearAllMocks();

      svc.updateUserInfo();
      expect(clarity.setTag).not.toHaveBeenCalled();
    });
  });
});
