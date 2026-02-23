import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CognitoService } from './cognito.service';
import { ApiService } from './api.service';
import { ClarityService } from './clarity.service';
import { ActionsService } from './actions.service';
import { AuthenticationService } from './authentication.service';

describe('CognitoService', () => {
  let service: CognitoService;
  let mockRouter: any;
  let mockApi: any;
  let mockClarity: any;
  let mockActions: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockRouter = { navigate: jest.fn(), events: of({}) };
    mockApi = {
      GET_loginWithAzureAd: jest.fn(),
      POST_validateCognitoCode: jest.fn(),
      POST_cognitoAuth: jest.fn(),
      POST_cognitoChangePassword: jest.fn(),
    };
    mockClarity = { updateUserInfo: jest.fn() };
    mockActions = { showGlobalAlert: jest.fn() };
    mockAuthService = {
      setUserLogged: jest.fn(),
      currentUser: of(null),
      currentUserSubject: { value: null },
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CognitoService,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
        { provide: ApiService, useValue: mockApi },
        { provide: ClarityService, useValue: mockClarity },
        { provide: ActionsService, useValue: mockActions },
        { provide: AuthenticationService, useValue: mockAuthService },
      ],
    });
    service = TestBed.inject(CognitoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loginWithAzureAd', () => {
    it('should return early if already loading', async () => {
      service.isLoadingAzureAd.set(true);
      await service.loginWithAzureAd();
      expect(mockApi.GET_loginWithAzureAd).not.toHaveBeenCalled();
    });

    it('should set loading, call API, and set window.location.href on success', async () => {
      const originalLocation = window.location;
      delete (window as any).location;
      (window as any).location = { href: '' };

      mockApi.GET_loginWithAzureAd.mockResolvedValue({ data: { authUrl: 'https://login.example.com' } });

      await service.loginWithAzureAd();
      expect(mockApi.GET_loginWithAzureAd).toHaveBeenCalled();
      expect(window.location.href).toBe('https://login.example.com');
      expect(service.isLoadingAzureAd()).toBe(false);

      window.location = originalLocation;
    });

    it('should show alert on error', async () => {
      mockApi.GET_loginWithAzureAd.mockRejectedValue(new Error('fail'));

      await service.loginWithAzureAd();

      expect(mockActions.showGlobalAlert).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warning' })
      );
      expect(service.isLoadingAzureAd()).toBe(false);
    });
  });

  describe('validateCognitoCode', () => {
    it('should return early when no code in query params', async () => {
      await service.validateCognitoCode();
      expect(mockApi.POST_validateCognitoCode).not.toHaveBeenCalled();
    });

    it('should call API and update cache on success', async () => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.snapshot as any).queryParams = { code: 'test-code' };

      const mockRes = { data: { id: 1, username: 'test' } };
      mockApi.POST_validateCognitoCode.mockReturnValue(of(mockRes));

      jest.useFakeTimers();
      await service.validateCognitoCode();

      expect(mockApi.POST_validateCognitoCode).toHaveBeenCalledWith('test-code');
      expect(mockClarity.updateUserInfo).toHaveBeenCalled();
      expect(mockAuthService.setUserLogged).toHaveBeenCalledWith(mockRes.data);

      jest.advanceTimersByTime(300);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      jest.useRealTimers();
    });

    it('should show alert with 401 message on error', async () => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.snapshot as any).queryParams = { code: 'test-code' };

      mockApi.POST_validateCognitoCode.mockReturnValue(throwError(() => ({
        error: { status: 401, description: 'Unauthorized' },
      })));

      await service.validateCognitoCode();

      expect(mockActions.showGlobalAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 'Error while trying to validate Cognito code',
        })
      );
    });

    it('should show description for non-401 errors', async () => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.snapshot as any).queryParams = { code: 'test-code' };

      mockApi.POST_validateCognitoCode.mockReturnValue(throwError(() => ({
        error: { status: 500, description: 'Server Error' },
      })));

      await service.validateCognitoCode();

      expect(mockActions.showGlobalAlert).toHaveBeenCalledWith(
        expect.objectContaining({ detail: 'Server Error' })
      );
    });

    it('should navigate to login on close callback for error', async () => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.snapshot as any).queryParams = { code: 'test-code' };

      mockApi.POST_validateCognitoCode.mockReturnValue(throwError(() => ({
        error: { status: 500, description: 'err' },
      })));

      await service.validateCognitoCode();

      const alertCall = mockActions.showGlobalAlert.mock.calls[0][0];
      alertCall.callback.onClose();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('loginWithCredentials', () => {
    const validBody = { username: 'user', password: 'pass', confirmPassword: '' };

    it('should return early if already loading', async () => {
      service.isLoadingCredentials.set(true);
      await service.loginWithCredentials(validBody);
      expect(mockApi.POST_cognitoAuth).not.toHaveBeenCalled();
    });

    it('should return early if username is empty', async () => {
      await service.loginWithCredentials({ username: '', password: 'pass', confirmPassword: '' });
      expect(mockApi.POST_cognitoAuth).not.toHaveBeenCalled();
    });

    it('should return early if password is empty', async () => {
      await service.loginWithCredentials({ username: 'user', password: '', confirmPassword: '' });
      expect(mockApi.POST_cognitoAuth).not.toHaveBeenCalled();
    });

    it('should handle NEW_PASSWORD_REQUIRED challenge', async () => {
      mockApi.POST_cognitoAuth.mockReturnValue(of({
        data: { challengeName: 'NEW_PASSWORD_REQUIRED', session: 'sess-123' },
      }));

      await service.loginWithCredentials(validBody);

      expect(service.requiredChangePassword()).toBe(true);
      expect(service.isLoadingCredentials()).toBe(false);
      expect(service.chagePasswordSession()).toBe('sess-123');
    });

    it('should update cache and redirect on successful login', async () => {
      const mockRes = { data: { id: 1, username: 'user' } };
      mockApi.POST_cognitoAuth.mockReturnValue(of(mockRes));

      jest.useFakeTimers();
      await service.loginWithCredentials(validBody);

      expect(mockClarity.updateUserInfo).toHaveBeenCalled();
      expect(mockAuthService.setUserLogged).toHaveBeenCalledWith(mockRes.data);
      expect(service.isLoadingCredentials()).toBe(false);
      expect(service.requiredChangePassword()).toBe(false);

      jest.advanceTimersByTime(300);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      jest.useRealTimers();
    });

    it('should show alert for 404 error', async () => {
      mockApi.POST_cognitoAuth.mockReturnValue(throwError(() => ({
        error: { status: 404 },
      })));

      await service.loginWithCredentials(validBody);

      expect(mockActions.showGlobalAlert).toHaveBeenCalledWith(
        expect.objectContaining({ detail: expect.stringContaining('not registered') })
      );
    });

    it('should show alert for 401 error', async () => {
      mockApi.POST_cognitoAuth.mockReturnValue(throwError(() => ({
        error: { status: 401 },
      })));

      await service.loginWithCredentials(validBody);

      expect(mockActions.showGlobalAlert).toHaveBeenCalledWith(
        expect.objectContaining({ detail: 'Invalid credentials' })
      );
    });

    it('should show generic alert for other errors', async () => {
      mockApi.POST_cognitoAuth.mockReturnValue(throwError(() => ({
        error: { status: 500, description: 'Internal Error' },
      })));

      await service.loginWithCredentials(validBody);

      expect(mockActions.showGlobalAlert).toHaveBeenCalledWith(
        expect.objectContaining({ detail: 'Internal Error' })
      );
    });
  });

  describe('changePassword', () => {
    it('should call API and redirect on success', async () => {
      service.body.set({ username: 'user', password: 'newpass', confirmPassword: 'newpass' });
      service.chagePasswordSession.set('sess-123');

      const mockRes = { data: { id: 1 } };
      mockApi.POST_cognitoChangePassword.mockResolvedValue(mockRes);

      jest.useFakeTimers();
      await service.changePassword();

      expect(mockApi.POST_cognitoChangePassword).toHaveBeenCalledWith({
        session: 'sess-123',
        newPassword: 'newpass',
        username: 'user',
      });
      expect(service.isLoadingCredentials()).toBe(false);
      expect(service.requiredChangePassword()).toBe(false);

      jest.advanceTimersByTime(300);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      jest.useRealTimers();
    });

    it('should show alert on error', async () => {
      service.body.set({ username: 'user', password: 'newpass', confirmPassword: 'newpass' });
      service.chagePasswordSession.set('sess-123');

      mockApi.POST_cognitoChangePassword.mockRejectedValue({ error: { message: 'Password too weak' } });

      await service.changePassword();

      expect(service.isLoadingCredentials()).toBe(false);
      expect(mockActions.showGlobalAlert).toHaveBeenCalledWith(
        expect.objectContaining({ detail: 'Password too weak' })
      );
    });
  });

  describe('updateCacheService', () => {
    it('should call clarity updateUserInfo and authenticationService setUserLogged', () => {
      const resp = { data: { id: 1, username: 'test' } };
      service.updateCacheService(resp);

      expect(mockClarity.updateUserInfo).toHaveBeenCalled();
      expect(mockAuthService.setUserLogged).toHaveBeenCalledWith(resp.data);
    });
  });

  describe('redirectToHome', () => {
    it('should navigate to /dashboard after 300ms', () => {
      jest.useFakeTimers();
      service.redirectToHome();
      expect(mockRouter.navigate).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      jest.useRealTimers();
    });
  });
});
