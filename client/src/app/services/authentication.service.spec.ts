import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AuthenticationService } from './authentication.service';
import { CookiesService } from './cookie-service.service';
import { environment } from '../../environments/environment';
import { createMockUser, createMockCRPUser } from '../test-helpers/mock-data';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  let mockRouter: any;
  let mockCookiesService: any;

  beforeEach(() => {
    mockRouter = { url: '/dashboard', navigate: jest.fn() };
    mockCookiesService = { delete: jest.fn(), set: jest.fn() };

    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthenticationService,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: CookiesService, useValue: mockCookiesService },
      ],
    });
    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('currentUserValue', () => {
    it('should return user from usrCookie when URL does not contain crp', () => {
      mockRouter.url = '/dashboard';
      const user = createMockUser();
      localStorage.setItem('currentUser', JSON.stringify(user));

      const result = service.currentUserValue;
      expect(result).toBeTruthy();
      expect(result.username).toBe('testuser');
    });

    it('should return user from crpUsrCookie when URL starts with /crp', () => {
      mockRouter.url = '/crp/dashboard';
      const crpUser = createMockCRPUser({ username: 'crpuser' });
      localStorage.setItem('currentUserCRP', JSON.stringify(crpUser));

      const result = service.currentUserValue;
      expect(result).toBeTruthy();
      expect(result.username).toBe('crpuser');
    });

    it('should return null when no user in localStorage', () => {
      mockRouter.url = '/dashboard';
      const result = service.currentUserValue;
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should post credentials and call setUserLogged', () => {
      const mockUser = createMockUser();
      service.login('testuser', 'password').subscribe(result => {
        expect(result).toBeTruthy();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'testuser', password: 'password' });
      req.flush({ data: mockUser });
    });
  });

  describe('tokenLogin', () => {
    it('should post params and call parseMultipleCRP and setUserLogged', () => {
      const mockUser = createMockUser({ crps: [{ crp_id: 5, name: 'CRP5' }] });
      const params = { token: 'abc', crp_id: 5 };

      service.tokenLogin(params).subscribe(result => {
        expect(result).toBeTruthy();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}auth/token/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: mockUser });
    });
  });

  describe('setUserLogged', () => {
    it('should return undefined when user is null/falsy', () => {
      const result = service.setUserLogged(null as any);
      expect(result).toBeUndefined();
    });

    it('should store user in usrCookie when user.crp is null', () => {
      const user = createMockUser({ crp: null, indicators: [] });
      const result = service.setUserLogged(user);

      expect(result).toBeTruthy();
      expect(result.password).toBeUndefined();
      const stored = JSON.parse(localStorage.getItem('currentUser')!);
      expect(stored.username).toBe('testuser');
    });

    it('should store user in crpUsrCookie when user.crp is not null', () => {
      const user = createMockCRPUser({ indicators: [] });
      service.setUserLogged(user);

      const stored = JSON.parse(localStorage.getItem('currentUserCRP')!);
      expect(stored.username).toBe('testuser');
    });

    it('should delete password from user', () => {
      const user = createMockUser({ password: 'secret', indicators: [] });
      const result = service.setUserLogged(user);
      expect(result.password).toBeUndefined();
    });

    it('should clear previous user headers and indicators', () => {
      localStorage.setItem('indicators', 'old');
      service.userHeaders = ['old'];
      const user = createMockUser({ indicators: [{ indicator: { meta: 'x' } }] });
      service.setUserLogged(user);
      expect(localStorage.getItem('indicators')).not.toBe('old');
    });
  });

  describe('setLoggedUserTawkTo', () => {
    it('should set Tawk_API attributes when Tawk_API exists and visitor is engaged', () => {
      const mockEndChat = jest.fn();
      const mockSetAttributes = jest.fn();
      (window as any)['Tawk_API'] = {
        isVisitorEngaged: () => true,
        endChat: mockEndChat,
        setAttributes: mockSetAttributes,
      };

      service.setLoggedUserTawkTo({ username: 'test', email: 'test@test.com' });
      expect(mockEndChat).toHaveBeenCalled();
      expect(mockSetAttributes).toHaveBeenCalled();

      delete (window as any)['Tawk_API'];
    });

    it('should set Tawk_API attributes when visitor is not engaged', () => {
      const mockSetAttributes = jest.fn();
      (window as any)['Tawk_API'] = {
        isVisitorEngaged: () => false,
        endChat: jest.fn(),
        setAttributes: mockSetAttributes,
      };

      service.setLoggedUserTawkTo({ username: 'test', email: 'test@test.com' });
      expect(mockSetAttributes).toHaveBeenCalled();

      delete (window as any)['Tawk_API'];
    });

    it('should use setTimeout when Tawk_API does not exist initially', () => {
      jest.useFakeTimers();
      delete (window as any)['Tawk_API'];

      service.setLoggedUserTawkTo({ username: 'test', email: 'test@test.com' });

      // Set up Tawk_API before timer fires
      const mockSetAttributes = jest.fn();
      (window as any)['Tawk_API'] = {
        isVisitorEngaged: () => false,
        endChat: jest.fn(),
        setAttributes: mockSetAttributes,
      };

      jest.advanceTimersByTime(10000);
      expect(mockSetAttributes).toHaveBeenCalled();

      delete (window as any)['Tawk_API'];
      jest.useRealTimers();
    });

    it('should handle setTimeout when Tawk_API still does not exist after timeout', () => {
      jest.useFakeTimers();
      delete (window as any)['Tawk_API'];

      service.setLoggedUserTawkTo({ username: 'test', email: 'test@test.com' });
      jest.advanceTimersByTime(10000);
      // Should not throw
      jest.useRealTimers();
    });
  });

  describe('getBrowser', () => {
    const originalUserAgent = navigator.userAgent;

    afterEach(() => {
      Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, configurable: true });
    });

    it('should detect Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 Chrome/91.0', configurable: true });
      expect(service.getBrowser()).toBe('Chrome');
    });

    it('should detect Safari', () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 Safari/537.36', configurable: true });
      expect(service.getBrowser()).toBe('Safari');
    });

    it('should detect Firefox', () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 Firefox/89.0', configurable: true });
      expect(service.getBrowser()).toBe('Firefox');
    });

    it('should detect Opera', () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 Opera/77.0', configurable: true });
      expect(service.getBrowser()).toBe('Opera');
    });

    it('should detect IE', () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 MSIE 11.0', configurable: true });
      expect(service.getBrowser()).toBe('IE');
    });

    it('should return unknown for unrecognized browsers', () => {
      Object.defineProperty(navigator, 'userAgent', { value: 'UnknownBrowser/1.0', configurable: true });
      expect(service.getBrowser()).toBe('unknown');
    });
  });

  describe('parseIndicators', () => {
    it('should store indicators in localStorage when user has indicators', () => {
      const user = createMockUser({
        indicators: [
          { indicator: { meta: 'should-be-deleted', name: 'Ind1' } },
          { indicator: { meta: 'also-deleted', name: 'Ind2' } },
        ],
      });

      const result = service.parseIndicators(user);
      expect(result).toBe(user);

      const stored = JSON.parse(localStorage.getItem('indicators')!);
      expect(stored).toHaveLength(2);
      expect(stored[0].indicator.meta).toBeUndefined();
    });

    it('should not store indicators when user has no indicators property', () => {
      const user = { username: 'test' };
      service.parseIndicators(user);
      expect(localStorage.getItem('indicators')).toBeNull();
    });

    it('should not store indicators when indicators array is empty', () => {
      const user = createMockUser({ indicators: [] });
      service.parseIndicators(user);
      expect(localStorage.getItem('indicators')).toBeNull();
    });
  });

  describe('parseUpdateIndicators', () => {
    it('should store indicators in localStorage and delete meta when array is not empty', () => {
      const indicators = [
        { indicator: { meta: 'remove', name: 'I1' } },
        { indicator: { meta: 'remove2', name: 'I2' } },
      ] as any;

      const result = service.parseUpdateIndicators(indicators);
      const stored = JSON.parse(localStorage.getItem('indicators')!);
      expect(stored).toHaveLength(2);
      expect(stored[0].indicator.meta).toBeUndefined();
      expect(result).toBe(indicators);
    });

    it('should return empty array without storing when empty', () => {
      const indicators = [] as any;
      const result = service.parseUpdateIndicators(indicators);
      expect(result).toEqual([]);
      expect(localStorage.getItem('indicators')).toBeNull();
    });
  });

  describe('parseMultipleCRP', () => {
    it('should set user.crp when matching crp_id found', () => {
      const user = { crps: [{ crp_id: 1 }, { crp_id: 2 }] } as any;
      service.parseMultipleCRP(user, 2);
      expect(user.crp).toEqual({ crp_id: 2 });
    });

    it('should set user.crp to undefined when crp_id not found', () => {
      const user = { crps: [{ crp_id: 1 }] } as any;
      service.parseMultipleCRP(user, 999);
      expect(user.crp).toBeUndefined();
    });

    it('should not set crp when crps is empty', () => {
      const user = { crps: [] } as any;
      service.parseMultipleCRP(user);
      expect(user.crp).toBeUndefined();
    });
  });

  describe('markCyclesEnd', () => {
    it('should set cycle_ended to true when user has no cycle property', () => {
      const user: any = {};
      service.markCyclesEnd(user);
      expect(user.cycle_ended).toBe(true);
    });

    it('should not set cycle_ended when user has cycle property', () => {
      const user: any = { cycle: { id: 1 } };
      service.markCyclesEnd(user);
      expect(user.cycle_ended).toBeUndefined();
    });
  });

  describe('logout', () => {
    it('should clear all user data', () => {
      localStorage.setItem('currentUser', 'test');
      localStorage.setItem('indicators', 'test');
      service.userHeaders = ['header'];

      service.logout();

      expect(service.userHeaders).toEqual([]);
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(localStorage.getItem('indicators')).toBeNull();
      expect(mockCookiesService.delete).toHaveBeenCalledTimes(2);
    });

    it('should call logOutTawtkTo with Tawk_API', () => {
      const mockEndChat = jest.fn();
      (window as any)['Tawk_API'] = {
        endChat: mockEndChat,
        visitor: { name: 'test', email: 'test' },
      };

      service.logout();
      expect(mockEndChat).toHaveBeenCalled();
      expect((window as any)['Tawk_API'].visitor.name).toBeNull();

      delete (window as any)['Tawk_API'];
    });

    it('should handle logout when Tawk_API does not exist', () => {
      delete (window as any)['Tawk_API'];
      expect(() => service.logout()).not.toThrow();
    });

    it('should handle logout when Tawk_API.endChat throws', () => {
      (window as any)['Tawk_API'] = {
        endChat: () => { throw new Error('fail'); },
        visitor: {},
      };

      expect(() => service.logout()).not.toThrow();
      delete (window as any)['Tawk_API'];
    });
  });

  describe('getActualCycles', () => {
    it('should make GET request to actual-cycle endpoint', () => {
      service.getActualCycles().subscribe();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/actual-cycle`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: {} });
    });
  });

  describe('getCycles', () => {
    it('should make GET request to cycles endpoint', () => {
      service.getCycles().subscribe();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/cycles`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });
  });

  describe('updateLocalStorageUserCycle', () => {
    it('should return early when no user in localStorage', () => {
      service.updateLocalStorageUserCycle();
      httpMock.expectNone(`${environment.apiBaseUrl}comment/actual-cycle`);
    });

    it('should update user with cycle data when actual cycle returns data', () => {
      const user = createMockUser();
      delete user.cycle;
      localStorage.setItem('currentUser', JSON.stringify(user));

      service.updateLocalStorageUserCycle();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}comment/actual-cycle`);
      req.flush({ data: { id: 99, start_date: '2025-01-01', end_date: '2025-12-31' } });

      const stored = JSON.parse(localStorage.getItem('currentUser')!);
      expect(stored.cycle.id).toBe(99);
    });

    it('should fallback to findAndUpdateCurrentCycle when actual cycle returns null data', () => {
      const user = createMockUser();
      localStorage.setItem('currentUser', JSON.stringify(user));

      service.updateLocalStorageUserCycle();

      const req1 = httpMock.expectOne(`${environment.apiBaseUrl}comment/actual-cycle`);
      req1.flush({ data: null });

      const req2 = httpMock.expectOne(`${environment.apiBaseUrl}comment/cycles`);
      req2.flush({ data: [] });
    });

    it('should handle error in getActualCycles and fallback to findAndUpdateCurrentCycle', () => {
      const user = createMockUser();
      localStorage.setItem('currentUser', JSON.stringify(user));

      service.updateLocalStorageUserCycle();

      const req1 = httpMock.expectOne(`${environment.apiBaseUrl}comment/actual-cycle`);
      req1.error(new ProgressEvent('error'));

      // After error, should call getCycles as fallback
      const req2 = httpMock.expectOne(`${environment.apiBaseUrl}comment/cycles`);
      req2.flush({ data: [] });
    });
  });

  describe('findAndUpdateCurrentCycle (via updateLocalStorageUserCycle)', () => {
    it('should update localStorage when a matching current cycle is found', () => {
      const user = createMockUser();
      localStorage.setItem('currentUser', JSON.stringify(user));

      service.updateLocalStorageUserCycle();

      const req1 = httpMock.expectOne(`${environment.apiBaseUrl}comment/actual-cycle`);
      req1.flush({ data: null });

      const now = new Date();
      const startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      const endDate = new Date(now.getFullYear(), 11, 31).toISOString();

      const req2 = httpMock.expectOne(`${environment.apiBaseUrl}comment/cycles`);
      req2.flush({
        data: [
          { id: 50, start_date: startDate, end_date: endDate },
          { id: 51, start_date: '2020-01-01', end_date: '2020-12-31' },
        ],
      });

      const stored = JSON.parse(localStorage.getItem('currentUser')!);
      expect(stored.cycle.id).toBe(50);
    });

    it('should not update localStorage when no matching cycle found', () => {
      const user = createMockUser();
      localStorage.setItem('currentUser', JSON.stringify(user));

      service.updateLocalStorageUserCycle();

      const req1 = httpMock.expectOne(`${environment.apiBaseUrl}comment/actual-cycle`);
      req1.flush({ data: null });

      const req2 = httpMock.expectOne(`${environment.apiBaseUrl}comment/cycles`);
      req2.flush({
        data: [{ id: 51, start_date: '2020-01-01', end_date: '2020-12-31' }],
      });

      const stored = JSON.parse(localStorage.getItem('currentUser')!);
      // cycle should remain as original
      expect(stored.cycle.id).toBe(1);
    });

    it('should handle null data from getCycles', () => {
      const user = createMockUser();
      localStorage.setItem('currentUser', JSON.stringify(user));

      service.updateLocalStorageUserCycle();

      const req1 = httpMock.expectOne(`${environment.apiBaseUrl}comment/actual-cycle`);
      req1.flush({ data: null });

      const req2 = httpMock.expectOne(`${environment.apiBaseUrl}comment/cycles`);
      req2.flush({ data: null });
      // Should not throw
    });

    it('should handle error in getCycles', () => {
      const user = createMockUser();
      localStorage.setItem('currentUser', JSON.stringify(user));

      service.updateLocalStorageUserCycle();

      const req1 = httpMock.expectOne(`${environment.apiBaseUrl}comment/actual-cycle`);
      req1.flush({ data: null });

      const req2 = httpMock.expectOne(`${environment.apiBaseUrl}comment/cycles`);
      req2.error(new ProgressEvent('error'));
      // Should not throw, handled by catchError
    });
  });
});
