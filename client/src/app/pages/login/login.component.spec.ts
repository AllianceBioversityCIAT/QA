import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Title } from '@angular/platform-browser';

import LoginComponent from './login.component';
import { AuthenticationService } from '../../services/authentication.service';
import { CognitoService } from '../../services/cognito.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockCognitoService: any;
  let mockRouter: any;

  beforeEach(waitForAsync(() => {
    mockAuthService = {
      currentUser: of(null),
      currentUserValue: null,
      inLogin: { set: jest.fn() },
    };
    mockCognitoService = {
      body: jest.fn().mockReturnValue({ username: '', password: '', confirmPassword: '' }),
      requiredChangePassword: jest.fn().mockReturnValue(false),
      loginWithCredentials: jest.fn(),
      loginWithAzureAd: jest.fn(),
      changePassword: jest.fn(),
    };
    mockRouter = { navigate: jest.fn(), events: of({}) };

    TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}), snapshot: { queryParams: {} } } },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: Router, useValue: mockRouter },
        { provide: Title, useValue: { setTitle: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(LoginComponent, { set: { imports: [], template: '' } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('validateBody', () => {
    it('should return true when username is empty', () => {
      mockCognitoService.body.mockReturnValue({ username: '', password: 'pass' });
      expect(component.validateBody()).toBe(true);
    });

    it('should return true when password is empty', () => {
      mockCognitoService.body.mockReturnValue({ username: 'user', password: '' });
      expect(component.validateBody()).toBe(true);
    });

    it('should return false when both provided', () => {
      mockCognitoService.body.mockReturnValue({ username: 'user', password: 'pass' });
      expect(component.validateBody()).toBe(false);
    });

    it('should check change password fields when requiredChangePassword', () => {
      mockCognitoService.requiredChangePassword.mockReturnValue(true);
      mockCognitoService.body.mockReturnValue({ username: 'user', password: 'Test@123', confirmPassword: 'Test@123' });
      expect(component.validateBody()).toBe(false);
    });

    it('should return true when confirmPassword is empty during change password', () => {
      mockCognitoService.requiredChangePassword.mockReturnValue(true);
      mockCognitoService.body.mockReturnValue({ username: 'user', password: 'Test@123', confirmPassword: '' });
      expect(component.validateBody()).toBe(true);
    });
  });

  describe('isPasswordValid', () => {
    it('should return true for valid password', () => {
      mockCognitoService.body.mockReturnValue({ password: 'Test@123' });
      expect(component.isPasswordValid()).toBe(true);
    });

    it('should return false for missing lowercase', () => {
      mockCognitoService.body.mockReturnValue({ password: 'TEST@123' });
      expect(component.isPasswordValid()).toBe(false);
    });

    it('should return false for missing uppercase', () => {
      mockCognitoService.body.mockReturnValue({ password: 'test@123' });
      expect(component.isPasswordValid()).toBe(false);
    });

    it('should return false for too short', () => {
      mockCognitoService.body.mockReturnValue({ password: 'Ts@1' });
      expect(component.isPasswordValid()).toBe(false);
    });

    it('should return false for missing special char', () => {
      mockCognitoService.body.mockReturnValue({ password: 'Test1234' });
      expect(component.isPasswordValid()).toBe(false);
    });

    it('should return false for leading space', () => {
      mockCognitoService.body.mockReturnValue({ password: ' Test@123' });
      expect(component.isPasswordValid()).toBe(false);
    });

    it('should return true when requiredChangePassword and empty password', () => {
      mockCognitoService.requiredChangePassword.mockReturnValue(true);
      mockCognitoService.body.mockReturnValue({ password: '' });
      expect(component.isPasswordValid()).toBe(true);
    });
  });

  describe('doPasswordsMatch', () => {
    it('should return true when passwords match', () => {
      mockCognitoService.body.mockReturnValue({ password: 'Test@123', confirmPassword: 'Test@123' });
      expect(component.doPasswordsMatch()).toBe(true);
    });

    it('should return false when passwords differ', () => {
      mockCognitoService.body.mockReturnValue({ password: 'Test@123', confirmPassword: 'Different' });
      expect(component.doPasswordsMatch()).toBe(false);
    });
  });

  describe('handleKeyDown', () => {
    it('should login when Enter pressed and form valid', () => {
      mockCognitoService.body.mockReturnValue({ username: 'user', password: 'pass' });
      component.handleKeyDown({ key: 'Enter' } as KeyboardEvent);
      expect(mockCognitoService.loginWithCredentials).toHaveBeenCalled();
    });

    it('should change password when Enter and requiredChangePassword', () => {
      mockCognitoService.requiredChangePassword.mockReturnValue(true);
      mockCognitoService.body.mockReturnValue({ username: 'user', password: 'Test@123', confirmPassword: 'Test@123' });
      component.handleKeyDown({ key: 'Enter' } as KeyboardEvent);
      expect(mockCognitoService.changePassword).toHaveBeenCalled();
    });

    it('should not act when key is not Enter', () => {
      mockCognitoService.body.mockReturnValue({ username: 'user', password: 'pass' });
      component.handleKeyDown({ key: 'Escape' } as KeyboardEvent);
      expect(mockCognitoService.loginWithCredentials).not.toHaveBeenCalled();
    });

    it('should not act when form is invalid', () => {
      mockCognitoService.body.mockReturnValue({ username: '', password: '' });
      component.handleKeyDown({ key: 'Enter' } as KeyboardEvent);
      expect(mockCognitoService.loginWithCredentials).not.toHaveBeenCalled();
    });
  });

  describe('hasLowerCase', () => {
    it('should return true when has lowercase', () => {
      expect(component.hasLowerCase('aBc')).toBe(true);
    });

    it('should return false when no lowercase', () => {
      expect(component.hasLowerCase('ABC')).toBe(false);
    });
  });

  describe('hasUpperCase', () => {
    it('should return true when has uppercase', () => {
      expect(component.hasUpperCase('aBc')).toBe(true);
    });

    it('should return false when no uppercase', () => {
      expect(component.hasUpperCase('abc')).toBe(false);
    });
  });

  describe('hasMinLength', () => {
    it('should return true for 8+ chars', () => {
      expect(component.hasMinLength('12345678')).toBe(true);
    });

    it('should return false for <8 chars', () => {
      expect(component.hasMinLength('1234567')).toBe(false);
    });
  });

  describe('hasSpecialCharacter', () => {
    it('should return true when has special char', () => {
      expect(component.hasSpecialCharacter('abc@')).toBe(true);
    });

    it('should return false when no special char', () => {
      expect(component.hasSpecialCharacter('abc123')).toBe(false);
    });
  });

  describe('hasNoLeadingTrailingSpaces', () => {
    it('should return true for trimmed string', () => {
      expect(component.hasNoLeadingTrailingSpaces('abc')).toBe(true);
    });

    it('should return false for leading space', () => {
      expect(component.hasNoLeadingTrailingSpaces(' abc')).toBe(false);
    });

    it('should return false for trailing space', () => {
      expect(component.hasNoLeadingTrailingSpaces('abc ')).toBe(false);
    });
  });

  describe('toggleLoginForm', () => {
    it('should toggle showLoginForm signal', () => {
      expect(component.showLoginForm()).toBe(false);
      component.toggleLoginForm();
      expect(component.showLoginForm()).toBe(true);
      component.toggleLoginForm();
      expect(component.showLoginForm()).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should redirect when currentUserValue exists', () => {
      mockAuthService.currentUserValue = { id: 1 };
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should not redirect when no currentUserValue', () => {
      mockAuthService.currentUserValue = null;
      component.ngOnInit();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should set inLogin to true', () => {
      component.ngOnInit();
      expect(mockAuthService.inLogin.set).toHaveBeenCalledWith(true);
    });
  });

  describe('ngOnDestroy', () => {
    it('should set inLogin to false', () => {
      component.ngOnDestroy();
      expect(mockAuthService.inLogin.set).toHaveBeenCalledWith(false);
    });
  });
});
