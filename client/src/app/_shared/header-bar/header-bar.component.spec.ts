import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { of, Subject } from 'rxjs';

import { HeaderBarComponent } from './header-bar.component';
import { AuthenticationService } from '../../services/authentication.service';
import { IndicatorsService } from '../../services/indicators.service';
import { AlertService } from '../../services/alert.service';
import { createMockUser, createMockCRPUser } from '../../test-helpers/mock-data';

describe('HeaderBarComponent', () => {
  let component: HeaderBarComponent;
  let fixture: ComponentFixture<HeaderBarComponent>;
  let mockAuthService: any;
  let mockIndicatorService: any;
  let mockAlertService: any;
  let mockRouter: any;
  let routerEvents$: Subject<any>;

  const mockUser = createMockUser({ id: 1, name: 'Test User', crp: null });

  beforeEach(waitForAsync(() => {
    routerEvents$ = new Subject();
    mockAuthService = {
      currentUser: of(mockUser),
      currentUserValue: mockUser,
      userHeaders: [],
      logout: jest.fn(),
    };
    mockIndicatorService = {
      getIndicatorsByUser: jest.fn().mockReturnValue(of({
        data: [
          { indicator: { name: 'Knowledge Product', view_name: 'qa_knowledge_product', type: '' } },
          { indicator: { name: 'Innovation Use', view_name: 'qa_innovation_use', type: '' } },
        ],
      })),
    };
    mockAlertService = { error: jest.fn() };
    mockRouter = {
      navigate: jest.fn(),
      events: routerEvents$.asObservable(),
      url: '/dashboard/admin',
      isActive: jest.fn().mockReturnValue(false),
    };

    TestBed.configureTestingModule({
      imports: [HeaderBarComponent, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}) } },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: IndicatorsService, useValue: mockIndicatorService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(HeaderBarComponent, { set: { imports: [], template: '' } })
      .compileComponents();
  }));

  beforeEach(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(HeaderBarComponent);
    component = fixture.componentInstance;
    component.currentUser = mockUser as any;
    component.currentRole = 'admin';
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('headerAvailable', () => {
    it('should return false for root path', () => {
      mockRouter.url = '/';
      expect(component.headerAvailable()).toBe(false);
    });

    it('should return false for login path', () => {
      mockRouter.url = '/login';
      expect(component.headerAvailable()).toBe(false);
    });

    it('should return false for auth path', () => {
      mockRouter.url = '/auth/callback';
      expect(component.headerAvailable()).toBe(false);
    });

    it('should return false for crp path', () => {
      mockRouter.url = '/crp/dashboard';
      expect(component.headerAvailable()).toBe(false);
    });

    it('should return false for qa-close path', () => {
      mockRouter.url = '/qa-close';
      expect(component.headerAvailable()).toBe(false);
    });

    it('should return true for dashboard path', () => {
      mockRouter.url = '/dashboard/admin';
      expect(component.headerAvailable()).toBe(true);
    });

    it('should return true for indicator path', () => {
      mockRouter.url = '/indicator/knowledge_product/id';
      expect(component.headerAvailable()).toBe(true);
    });
  });

  describe('isCRP', () => {
    it('should return false when user has no crp', () => {
      component.currentUser = createMockUser({ crp: null }) as any;
      expect(component.isCRP()).toBe(false);
    });

    it('should return true when user has crp', () => {
      component.currentUser = createMockCRPUser() as any;
      expect(component.isCRP()).toBe(true);
    });

    it('should return false when currentUser is null', () => {
      component.currentUser = null;
      expect(component.isCRP()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should call auth logout and navigate to login', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getHeaderLinks', () => {
    it('should use cached indicators when available', () => {
      component.indicators = [{ indicator: { name: 'Test' } }] as any;
      component.currentUserID = 1;
      mockAuthService.userHeaders = [{ indicator: { name: 'Test' } }];
      localStorage.setItem('indicators', JSON.stringify([{ indicator: { name: 'Test' } }]));
      component.getHeaderLinks();
      expect(mockIndicatorService.getIndicatorsByUser).not.toHaveBeenCalled();
    });

    it('should fetch indicators when not cached and not CRP', () => {
      component.indicators = [];
      component.currentUserID = 1;
      mockAuthService.userHeaders = [];
      component.getHeaderLinks();
      expect(mockIndicatorService.getIndicatorsByUser).toHaveBeenCalledWith(1);
    });

    it('should not fetch indicators for CRP user', () => {
      component.currentUser = createMockCRPUser() as any;
      component.indicators = [];
      component.currentUserID = 1;
      mockIndicatorService.getIndicatorsByUser.mockClear();
      component.getHeaderLinks();
      expect(mockIndicatorService.getIndicatorsByUser).not.toHaveBeenCalled();
    });

    it('should handle error on fetch', () => {
      const { throwError } = require('rxjs');
      mockIndicatorService.getIndicatorsByUser.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.indicators = [];
      component.currentUserID = 1;
      component.getHeaderLinks();
      expect(mockAlertService.error).toHaveBeenCalled();
    });

    it('should save to localStorage when indicators already loaded for current user', () => {
      component.indicators = [{ indicator: { name: 'Test', view_name: 'qa_test' } }] as any;
      component.currentUserID = 1;
      mockAuthService.userHeaders = [];
      localStorage.removeItem('indicators');
      component.getHeaderLinks();
      expect(localStorage.getItem('indicators')).toBeTruthy();
    });
  });

  describe('groupIndicatorsByLevel', () => {
    it('should group indicators by level', () => {
      component.indicators = [
        { indicator: { name: 'Knowledge Product', view_name: 'qa_knowledge_product' } },
        { indicator: { name: 'Innovation Use', view_name: 'qa_innovation_use' } },
        { indicator: { name: 'Innovation Use (IPSR)', view_name: 'qa_innovation_use_ipsr' } },
      ] as any;
      component.groupIndicatorsByLevel();
      expect(component.groupedIndicators['Output']).toHaveLength(1);
      expect(component.groupedIndicators['Outcome']).toHaveLength(1);
      expect(component.groupedIndicators['Innovation Packages']).toHaveLength(1);
    });

    it('should skip indicators without matching level', () => {
      component.indicators = [
        { indicator: { name: 'Unknown', view_name: 'qa_unknown' } },
      ] as any;
      component.groupIndicatorsByLevel();
      expect(component.groupedIndicators['Output']).toHaveLength(0);
      expect(component.groupedIndicators['Outcome']).toHaveLength(0);
    });

    it('should skip indicators with empty level', () => {
      component.indicators = [
        { indicator: { name: 'Impact Contribution', view_name: 'qa_impact_contribution' } },
      ] as any;
      component.groupIndicatorsByLevel();
      // Impact Contribution has level: '' which is falsy
      expect(component.groupedIndicators['Output']).toHaveLength(0);
    });
  });

  describe('getIndicatorsByLevel', () => {
    it('should return indicators for valid level', () => {
      component.groupedIndicators = { Output: [{ id: 1 }] as any, Outcome: [], 'Innovation Packages': [] };
      expect(component.getIndicatorsByLevel('Output')).toHaveLength(1);
    });

    it('should return empty array for unknown level', () => {
      expect(component.getIndicatorsByLevel('Unknown')).toEqual([]);
    });
  });

  describe('hasIndicatorsInLevel', () => {
    it('should return true when indicators exist', () => {
      component.groupedIndicators = { Output: [{ id: 1 }] as any, Outcome: [], 'Innovation Packages': [] };
      expect(component.hasIndicatorsInLevel('Output')).toBe(true);
    });

    it('should return false when empty', () => {
      component.groupedIndicators = { Output: [], Outcome: [], 'Innovation Packages': [] };
      expect(component.hasIndicatorsInLevel('Output')).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should reset indicators when user ID changes', () => {
      component.currentUserID = 999;
      component.currentUser = createMockUser({ id: 1 }) as any;
      component.indicators = [{ id: 1 }] as any;
      component.ngOnInit();
      expect(component.currentUserID).toBe(1);
    });

    it('should call getHeaderLinks when currentUser exists and ID matches', () => {
      component.currentUserID = 1;
      component.currentUser = createMockUser({ id: 1 }) as any;
      const spy = jest.spyOn(component, 'getHeaderLinks');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('toggleUserMenu', () => {
    it('should toggle userMenuOpen', () => {
      component.userMenuOpen = false;
      component.toggleUserMenu();
      expect(component.userMenuOpen).toBe(true);
      component.toggleUserMenu();
      expect(component.userMenuOpen).toBe(false);
    });
  });

  describe('getInitials', () => {
    it('should return initials from full name', () => {
      expect(component.getInitials('John Doe')).toBe('JD');
    });

    it('should return first two chars for single name', () => {
      expect(component.getInitials('John')).toBe('JO');
    });

    it('should return U for empty name', () => {
      expect(component.getInitials('')).toBe('U');
    });

    it('should return U for null', () => {
      expect(component.getInitials(null)).toBe('U');
    });

    it('should handle multiple names', () => {
      expect(component.getInitials('John Michael Doe')).toBe('JD');
    });
  });

  describe('onDocumentClick', () => {
    it('should close menu when clicking outside', () => {
      component.userMenuOpen = true;
      const event = { target: { closest: jest.fn().mockReturnValue(null) } } as any;
      component.onDocumentClick(event);
      expect(component.userMenuOpen).toBe(false);
    });

    it('should keep menu open when clicking inside', () => {
      component.userMenuOpen = true;
      const event = { target: { closest: jest.fn().mockReturnValue(document.createElement('div')) } } as any;
      component.onDocumentClick(event);
      expect(component.userMenuOpen).toBe(true);
    });
  });

  describe('getCurrentRoute', () => {
    it('should call router.isActive with correct path', () => {
      component.currentRole = 'admin';
      component.getCurrentRoute();
      expect(mockRouter.isActive).toHaveBeenCalledWith('/dashboard/admin', true);
    });
  });
});
