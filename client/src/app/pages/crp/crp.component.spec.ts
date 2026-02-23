import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';

import CrpComponent from './crp.component';
import { AuthenticationService } from '../../services/authentication.service';
import { IndicatorsService } from '../../services/indicators.service';
import { AlertService } from '../../services/alert.service';
import { createMockCRPUser } from '../../test-helpers/mock-data';

describe('CrpComponent', () => {
  let component: CrpComponent;
  let fixture: ComponentFixture<CrpComponent>;
  let mockAuthService: any;
  let mockIndicatorService: any;
  let mockAlertService: any;
  let mockSpinner: any;
  let mockRouter: any;
  let routerEvents$: Subject<any>;

  const mockUser = createMockCRPUser({ id: 1, crp: { crp_id: 5, acronym: 'CRP5' } });

  beforeEach(waitForAsync(() => {
    routerEvents$ = new Subject();
    mockAuthService = {
      currentUser: of(mockUser),
      currentUserValue: mockUser,
      tokenLogin: jest.fn().mockReturnValue(of({ data: mockUser })),
      logout: jest.fn(),
    };
    mockIndicatorService = {
      getIndicators: jest.fn().mockReturnValue(of({ data: [{ order: 2 }, { order: 1 }] })),
      getCRP: jest.fn().mockReturnValue(of({ data: { id: 5, name: 'CRP5' } })),
    };
    mockAlertService = { error: jest.fn() };
    mockSpinner = { show: jest.fn(), hide: jest.fn() };
    mockRouter = {
      navigate: jest.fn(),
      events: routerEvents$.asObservable(),
    };

    TestBed.configureTestingModule({
      imports: [CrpComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            queryParamMap: of({
              params: { crp_id: '5' },
              has: jest.fn().mockReturnValue(false),
              get: jest.fn().mockReturnValue('5'),
            }),
            route: {},
          },
        },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: IndicatorsService, useValue: mockIndicatorService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: Router, useValue: mockRouter },
        { provide: CookieService, useValue: { get: jest.fn(), set: jest.fn(), delete: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(CrpComponent, { set: { imports: [], template: '' } })
      .compileComponents();
  }));

  beforeEach(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(CrpComponent);
    component = fixture.componentInstance;
    component.currentUser = mockUser as any;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getCRPIndicators', () => {
    it('should fetch indicators when not loaded and user exists', () => {
      component.indicators = [];
      component.getCRPIndicators();
      expect(mockIndicatorService.getIndicators).toHaveBeenCalled();
      expect(component.indicators).toHaveLength(2);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/crp/dashboard']);
    });

    it('should not fetch when indicators already loaded', () => {
      component.indicators = [{ id: 1 }] as any;
      mockIndicatorService.getIndicators.mockClear();
      component.getCRPIndicators();
      expect(mockIndicatorService.getIndicators).not.toHaveBeenCalled();
    });

    it('should not fetch when currentUser is null', () => {
      component.indicators = [];
      component.currentUser = null;
      mockIndicatorService.getIndicators.mockClear();
      component.getCRPIndicators();
      expect(mockIndicatorService.getIndicators).not.toHaveBeenCalled();
    });

    it('should handle error', () => {
      component.indicators = [];
      mockIndicatorService.getIndicators.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.getCRPIndicators();
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('should login and fetch data', () => {
      component.crp_id = '5';
      component.validateToken({ token: 'abc' });
      expect(mockAuthService.tokenLogin).toHaveBeenCalledWith({ token: 'abc' });
      expect(mockIndicatorService.getCRP).toHaveBeenCalledWith('5');
    });

    it('should handle error', () => {
      mockAuthService.tokenLogin.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.validateToken({ token: 'abc' });
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call auth logout and navigate to qa-close', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/qa-close'], expect.any(Object));
    });
  });

  describe('clearSavedData', () => {
    it('should call auth logout', () => {
      component.clearSavedData();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should load indicators from localStorage', () => {
      localStorage.setItem('indicatorsCRP', JSON.stringify([{ id: 1 }]));
      component.ngOnInit();
      expect(component.indicators).toEqual([{ id: 1 }]);
    });

    it('should default to empty array when no localStorage data', () => {
      localStorage.removeItem('indicatorsCRP');
      component.ngOnInit();
      expect(component.indicators).toEqual([]);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe and hide spinner', () => {
      component.ngOnInit();
      component.ngOnDestroy();
      expect(mockSpinner.hide).toHaveBeenCalledWith('crpNavigating');
    });
  });
});
