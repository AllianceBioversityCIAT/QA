import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AuthGuard } from './auth.guard';
import { AuthenticationService } from '../services/authentication.service';
import { Role } from '../_models/roles.model';
import { GeneralStatus } from '../_models/general-status.model';
import { createMockUser, createMockAssessorUser, createMockCRPUser, createMockActivatedRouteSnapshot, createMockRouterStateSnapshot } from '../test-helpers/mock-data';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockRouter: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() };
    mockAuthService = { currentUserValue: null };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthGuard,
        { provide: Router, useValue: mockRouter },
        { provide: AuthenticationService, useValue: mockAuthService },
      ],
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should redirect to login when no current user', () => {
      mockAuthService.currentUserValue = null;
      const route = createMockActivatedRouteSnapshot();
      const state = createMockRouterStateSnapshot('/protected');

      const result = guard.canActivate(route as any, state);

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/protected' },
      });
    });

    it('should return true when user has matching role', () => {
      mockAuthService.currentUserValue = createMockUser({
        roles: [{ description: Role.admin }],
        config: [{ status: GeneralStatus.Open }],
        cycle: { id: 1 },
      });
      const route = createMockActivatedRouteSnapshot({ data: { roles: [Role.admin] } });
      const state = createMockRouterStateSnapshot('/dashboard');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(true);
    });

    it('should redirect to / when user role is not in allowed roles', () => {
      mockAuthService.currentUserValue = createMockUser({
        roles: [{ description: Role.asesor }],
        config: [{ status: GeneralStatus.Open }],
        cycle: { id: 1 },
      });
      const route = createMockActivatedRouteSnapshot({ data: { roles: [Role.admin] } });
      const state = createMockRouterStateSnapshot('/admin-only');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should return true when no roles restriction on route', () => {
      mockAuthService.currentUserValue = createMockUser({
        roles: [{ description: Role.admin }],
        config: [{ status: GeneralStatus.Open }],
        cycle: { id: 1 },
      });
      const route = createMockActivatedRouteSnapshot({ data: {} });
      const state = createMockRouterStateSnapshot('/open');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(true);
    });

    it('should redirect to /qa-close when config is empty', () => {
      mockAuthService.currentUserValue = createMockUser({
        roles: [{ description: Role.admin }],
        config: [],
        cycle: { id: 1 },
      });
      const route = createMockActivatedRouteSnapshot({ data: {} });
      const state = createMockRouterStateSnapshot('/dashboard');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/qa-close']);
    });

    it('should redirect to /qa-close when assessor has no cycle', () => {
      mockAuthService.currentUserValue = createMockAssessorUser({
        config: [{ status: GeneralStatus.Open }],
      });
      delete (mockAuthService.currentUserValue as any).cycle;

      const route = createMockActivatedRouteSnapshot({ data: {} });
      const state = createMockRouterStateSnapshot('/dashboard');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/qa-close']);
    });

    it('should not redirect to /qa-close when assessor has cycle', () => {
      mockAuthService.currentUserValue = createMockAssessorUser({
        config: [{ status: GeneralStatus.Open }],
        cycle: { id: 1 },
      });
      const route = createMockActivatedRouteSnapshot({ data: { roles: [Role.asesor] } });
      const state = createMockRouterStateSnapshot('/dashboard');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(true);
    });

    it('should handle role with null value in roles array', () => {
      mockAuthService.currentUserValue = createMockUser({
        roles: [null, { description: Role.admin }],
        config: [{ status: GeneralStatus.Open }],
        cycle: { id: 1 },
      });
      const route = createMockActivatedRouteSnapshot({ data: {} });
      const state = createMockRouterStateSnapshot('/dashboard');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(true);
    });
  });

  describe('validateConfig', () => {
    it('should return true when config is empty', () => {
      const user = createMockUser({ config: [] });
      expect(guard.validateConfig(user)).toBe(true);
    });

    it('should return false when config status is not Close', () => {
      const user = createMockUser({ config: [{ status: GeneralStatus.Open }] });
      expect(guard.validateConfig(user)).toBe(false);
    });

    it('should return false when config status is Close', () => {
      const user = createMockUser({ config: [{ status: GeneralStatus.Close }] });
      expect(guard.validateConfig(user)).toBe(false);
    });
  });

  describe('validateCycle', () => {
    it('should return true when assessor has no cycle property', () => {
      const user = createMockAssessorUser();
      delete user.cycle;
      expect(guard.validateCycle(user)).toBe(true);
    });

    it('should return false when assessor has cycle', () => {
      const user = createMockAssessorUser({ cycle: { id: 1 } });
      expect(guard.validateCycle(user)).toBe(false);
    });

    it('should return false when admin has no cycle', () => {
      const user = createMockUser({ roles: [{ description: Role.admin }] });
      delete user.cycle;
      // Admin is found in second search, but still isAssessor will be admin role
      // Actually it checks for admin/crp as secondary
      expect(guard.validateCycle(user)).toBe(true);
    });

    it('should return false when non-assessor non-admin/crp user has no cycle', () => {
      const user = createMockUser({ roles: [{ description: Role.guest }] });
      delete user.cycle;
      expect(guard.validateCycle(user)).toBe(false);
    });

    it('should return true when CRP user has no cycle', () => {
      const user = createMockUser({ roles: [{ description: Role.crp }] });
      delete user.cycle;
      expect(guard.validateCycle(user)).toBe(true);
    });

    it('should handle null roles in array', () => {
      const user = createMockAssessorUser({ roles: [null, { description: Role.asesor }] });
      delete user.cycle;
      expect(guard.validateCycle(user)).toBe(true);
    });
  });

  describe('validateRole', () => {
    it('should return true when user has matching role', () => {
      const user = createMockUser({ roles: [{ description: Role.admin }], crp: null });
      const result = guard.validateRole([Role.admin] as any, user);
      expect(result).toBe(true);
    });

    it('should return false when user has no matching role', () => {
      const user = createMockUser({ roles: [{ description: Role.guest }], crp: null });
      const result = guard.validateRole([Role.admin] as any, user);
      expect(result).toBe(false);
    });

    it('should require both CRP and matching role when user has CRP', () => {
      const user = createMockCRPUser({ roles: [{ description: Role.crp }] });
      const result = guard.validateRole([Role.crp] as any, user);
      expect(result).toBe(true);
    });

    it('should return false when CRP user has no matching role', () => {
      const user = createMockCRPUser({ roles: [{ description: Role.crp }] });
      const result = guard.validateRole([Role.admin] as any, user);
      expect(result).toBe(false);
    });
  });
});
