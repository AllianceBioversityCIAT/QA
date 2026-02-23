import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { AvailableGuard } from './available.guard';
import { AuthenticationService } from '../services/authentication.service';
import { Role } from '../_models/roles.model';
import { CookiesService } from '../services/cookie-service.service';
import { ActionsService } from '../services/actions.service';
import { createMockUser, createMockAssessorUser, createMockActivatedRouteSnapshot, createMockRouterStateSnapshot } from '../test-helpers/mock-data';

describe('AvailableGuard', () => {
  let guard: AvailableGuard;
  let mockRouter: any;
  let mockAuthService: any;
  let mockActionsService: any;

  beforeEach(() => {
    mockRouter = { navigate: jest.fn(), events: of({}) };
    mockAuthService = { currentUserValue: null };
    mockActionsService = { showGlobalAlert: jest.fn() };

    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AvailableGuard,
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}) } },
        { provide: Router, useValue: mockRouter },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: CookiesService, useValue: {} },
        { provide: ActionsService, useValue: mockActionsService },
      ],
    });
    guard = TestBed.inject(AvailableGuard);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should redirect to login when no current user', () => {
      mockAuthService.currentUserValue = null;
      const route = createMockActivatedRouteSnapshot();
      const state = createMockRouterStateSnapshot('/crp/innovation_development/123');

      const result = guard.canActivate(route as any, state);

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/crp/innovation_development/123' },
      });
    });

    it('should return true when user is admin', () => {
      mockAuthService.currentUserValue = createMockUser({
        roles: [{ description: Role.admin }],
      });
      localStorage.setItem('indicators', JSON.stringify([
        { indicator: { view_name: 'qa_innovation_development', comment_meta: { enable_assessor: true } } },
      ]));

      const route = createMockActivatedRouteSnapshot();
      const state = createMockRouterStateSnapshot('/crp/innovation_development/123');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(true);
    });

    it('should return true when assessor and indicator has enable_assessor=true', () => {
      mockAuthService.currentUserValue = createMockAssessorUser();
      localStorage.setItem('indicators', JSON.stringify([
        { indicator: { view_name: 'qa_innovation_development', name: 'Innovation', comment_meta: { enable_assessor: true } } },
      ]));

      const route = createMockActivatedRouteSnapshot();
      const state = createMockRouterStateSnapshot('/crp/innovation_development/123');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(true);
    });

    it('should return true when assessor and indicator has enable_assessor=1', () => {
      mockAuthService.currentUserValue = createMockAssessorUser();
      localStorage.setItem('indicators', JSON.stringify([
        { indicator: { view_name: 'qa_innovation_development', name: 'Innovation', comment_meta: { enable_assessor: 1 } } },
      ]));

      const route = createMockActivatedRouteSnapshot();
      const state = createMockRouterStateSnapshot('/crp/innovation_development/123');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(true);
    });

    it('should show alert and return false when assessor and indicator has enable_assessor=false', () => {
      mockAuthService.currentUserValue = createMockAssessorUser();
      localStorage.setItem('indicators', JSON.stringify([
        { indicator: { view_name: 'qa_innovation_development', name: 'Innovation Dev', comment_meta: { enable_assessor: false } } },
      ]));

      const route = createMockActivatedRouteSnapshot();
      const state = createMockRouterStateSnapshot('/crp/innovation_development/123');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(false);
      expect(mockActionsService.showGlobalAlert).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warning', summary: 'Quality Assessment Not Available' })
      );
    });

    it('should show alert and return false when assessor and enable_assessor=0', () => {
      mockAuthService.currentUserValue = createMockAssessorUser();
      localStorage.setItem('indicators', JSON.stringify([
        { indicator: { view_name: 'qa_innovation_development', name: 'Innovation Dev', comment_meta: { enable_assessor: 0 } } },
      ]));

      const route = createMockActivatedRouteSnapshot();
      const state = createMockRouterStateSnapshot('/crp/innovation_development/123');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(false);
      expect(mockActionsService.showGlobalAlert).toHaveBeenCalled();
    });

    it('should redirect to dashboard when assessor and indicator not found', () => {
      mockAuthService.currentUserValue = createMockAssessorUser();
      localStorage.setItem('indicators', JSON.stringify([
        { indicator: { view_name: 'qa_other_output', comment_meta: { enable_assessor: true } } },
      ]));

      const route = createMockActivatedRouteSnapshot();
      const state = createMockRouterStateSnapshot('/crp/innovation_development/123');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should redirect to dashboard when assessor and indicator has no comment_meta', () => {
      mockAuthService.currentUserValue = createMockAssessorUser();
      localStorage.setItem('indicators', JSON.stringify([
        { indicator: { view_name: 'qa_innovation_development' } },
      ]));

      const route = createMockActivatedRouteSnapshot();
      const state = createMockRouterStateSnapshot('/crp/innovation_development/123');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should call onClose callback when alert is shown for disabled assessor', () => {
      mockAuthService.currentUserValue = createMockAssessorUser();
      localStorage.setItem('indicators', JSON.stringify([
        { indicator: { view_name: 'qa_innovation_development', name: 'Innovation Dev', comment_meta: { enable_assessor: false } } },
      ]));

      const route = createMockActivatedRouteSnapshot();
      const state = createMockRouterStateSnapshot('/crp/innovation_development/123');

      guard.canActivate(route as any, state);

      const alertCall = mockActionsService.showGlobalAlert.mock.calls[0][0];
      expect(alertCall.callback).toBeDefined();
      alertCall.callback.onClose();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle null roles in user roles array', () => {
      mockAuthService.currentUserValue = createMockUser({
        roles: [null, { description: Role.admin }],
      });
      localStorage.setItem('indicators', JSON.stringify([
        { indicator: { view_name: 'qa_test', comment_meta: {} } },
      ]));

      const route = createMockActivatedRouteSnapshot();
      const state = createMockRouterStateSnapshot('/crp/test/123');

      const result = guard.canActivate(route as any, state);
      expect(result).toBe(true);
    });

    it('should handle indicator without name for alert detail', () => {
      mockAuthService.currentUserValue = createMockAssessorUser();
      localStorage.setItem('indicators', JSON.stringify([
        { indicator: { view_name: 'qa_innovation_development', comment_meta: { enable_assessor: false } } },
      ]));

      const route = createMockActivatedRouteSnapshot();
      const state = createMockRouterStateSnapshot('/crp/innovation_development/123');

      guard.canActivate(route as any, state);

      const alertCall = mockActionsService.showGlobalAlert.mock.calls[0][0];
      expect(alertCall.detail).toContain('this indicator');
    });
  });
});
