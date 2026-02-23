// Mock @swimlane/ngx-charts before importing the component
jest.mock('@swimlane/ngx-charts', () => ({
  NgxChartsModule: class NgxChartsModule {},
  BarChartModule: class BarChartModule {},
  LineChartModule: class LineChartModule {},
  PieChartModule: class PieChartModule {},
  AdvancedPieChartModule: class AdvancedPieChartModule {},
  ScaleType: {
    Time: 'time',
    Linear: 'linear',
    Ordinal: 'ordinal',
    Quantile: 'quantile',
  },
}));

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Title } from '@angular/platform-browser';

import CrpDashboardComponent from './crp-dashboard.component';
import { DashboardService } from '../../../../services/dashboard.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { AlertService } from '../../../../services/alert.service';
import { CommentService } from '../../../../services/comment.service';
import { IndicatorsService } from '../../../../services/indicators.service';
import { ExportTablesService } from '../../../../services/export-tables.service';
import { createMockCRPUser } from '../../../../test-helpers/mock-data';

describe('CrpDashboardComponent', () => {
  let component: CrpDashboardComponent;
  let fixture: ComponentFixture<CrpDashboardComponent>;
  let mockDashService: any;
  let mockCommentService: any;
  let mockIndicatorService: any;
  let mockAlertService: any;
  let mockRouter: any;
  let mockExportService: any;
  let mockAuthService: any;

  const mockUser = createMockCRPUser({ id: 1, crp: { crp_id: 5, acronym: 'CRP5' } });

  beforeEach(waitForAsync(() => {
    mockDashService = {
      getAllDashboardEvaluationsByCRP: jest.fn().mockReturnValue(of({ data: {} })),
      groupData: jest.fn(d => d),
      groupByProp: jest.fn().mockReturnValue({}),
    };
    mockAuthService = {
      currentUser: of(mockUser),
      currentUserValue: mockUser,
      getBrowser: jest.fn().mockReturnValue('Chrome'),
    };
    mockCommentService = {
      getCommentCRPStats: jest.fn().mockReturnValue(of({ data: {} })),
      getRawComments: jest.fn().mockReturnValue(of({ data: [] })),
      getCommentsRawExcel: jest.fn().mockReturnValue(of({ data: [] })),
      getCommentsExcelByInitiative: jest.fn().mockReturnValue(of({ data: [] })),
    };
    mockIndicatorService = {
      getIndicators: jest.fn().mockReturnValue(of({ data: [] })),
      setOrderByStatus: jest.fn(),
    };
    mockAlertService = { error: jest.fn() };
    mockRouter = { navigate: jest.fn() };
    mockExportService = { exportExcel: jest.fn() };

    TestBed.configureTestingModule({
      imports: [CrpDashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({ id: '1' }), queryParams: of({}) } },
        { provide: DashboardService, useValue: mockDashService },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: NgxSpinnerService, useValue: { show: jest.fn(), hide: jest.fn() } },
        { provide: CommentService, useValue: mockCommentService },
        { provide: IndicatorsService, useValue: mockIndicatorService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: Router, useValue: mockRouter },
        { provide: Title, useValue: { setTitle: jest.fn() } },
        { provide: ExportTablesService, useValue: mockExportService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(CrpDashboardComponent, { set: { imports: [], template: '' } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrpDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formatCommentsIndicatorData', () => {
    it('should return empty for null data', () => {
      const result = component.formatCommentsIndicatorData(null);
      expect(result.dataset).toEqual([]);
    });

    it('should format all comment types including discarded', () => {
      const data = [
        { comments_accepted_with_comment: '5', comments_accepted_without_comment: '0', comments_rejected: '0', comments_discarded: '0', comments_without_answer: '0', pending_tpb_decisions: '0', value: '5' },
        { comments_accepted_with_comment: '0', comments_accepted_without_comment: '3', comments_rejected: '0', comments_discarded: '0', comments_without_answer: '0', pending_tpb_decisions: '0', value: '3' },
        { comments_accepted_with_comment: '0', comments_accepted_without_comment: '0', comments_rejected: '2', comments_discarded: '0', comments_without_answer: '0', pending_tpb_decisions: '0', value: '2' },
        { comments_accepted_with_comment: '0', comments_accepted_without_comment: '0', comments_rejected: '0', comments_discarded: '1', comments_without_answer: '0', pending_tpb_decisions: '0', value: '1' },
        { comments_accepted_with_comment: '0', comments_accepted_without_comment: '0', comments_rejected: '0', comments_discarded: '0', comments_without_answer: '4', pending_tpb_decisions: '0', value: '4' },
      ];
      const result = component.formatCommentsIndicatorData(data, 'qa_knowledge_product');
      expect(result.dataset.length).toBe(5);
      expect(component.totalPendings['qa_knowledge_product']).toBe(4);
    });

    it('should handle pending_tpb_decisions', () => {
      const data = [{ pending_tpb_decisions: '3', comments_accepted_with_comment: '0', comments_accepted_without_comment: '0', comments_rejected: '0', comments_discarded: '0', comments_without_answer: '0', value: '3' }];
      component.formatCommentsIndicatorData(data, 'qa_knowledge_product');
      expect(component.pendings['qa_knowledge_product']).toBeDefined();
    });

    it('should skip zero comments', () => {
      const data = [
        { comments_accepted_with_comment: '0', comments_accepted_without_comment: '0', comments_rejected: '0', comments_discarded: '0', comments_without_answer: '0', pending_tpb_decisions: '0', value: '0' },
      ];
      const result = component.formatCommentsIndicatorData(data);
      expect(result.dataset).toEqual([]);
    });

    it('should handle only discarded comments', () => {
      const data = [{ comments_discarded: '2', comments_accepted_with_comment: '0', comments_accepted_without_comment: '0', comments_rejected: '0', comments_without_answer: '0', pending_tpb_decisions: '0', value: '2' }];
      const result = component.formatCommentsIndicatorData(data);
      expect(result.dataset).toHaveLength(1);
      expect(result.dataset[0].name).toBe('Discarded');
    });
  });

  describe('formatStatusCharts', () => {
    it('should format status chart data from dashboardData', () => {
      component.dashboardData = {
        qa_knowledge_product: [
          { status: 'complete', value: '10' },
          { status: 'pending', value: '5' },
        ],
      } as any;
      component.statusChartData = { qa_knowledge_product: [] } as any;
      component.formatStatusCharts();
      expect(component.statusChartData['qa_knowledge_product']).toHaveLength(2);
      expect(component.statusChartData['qa_knowledge_product'][0].name).toBe('Assessed');
    });
  });

  describe('getCRPIndicators', () => {
    it('should fetch indicators when not loaded', () => {
      component.indicators = [];
      component.currentUser = mockUser as any;
      component.getCRPIndicators();
      expect(mockIndicatorService.getIndicators).toHaveBeenCalled();
    });

    it('should not fetch when indicators already loaded', () => {
      component.indicators = [{ id: 1 }] as any;
      component.getCRPIndicators();
      expect(mockIndicatorService.getIndicators).not.toHaveBeenCalled();
    });

    it('should handle error', () => {
      component.indicators = [];
      component.currentUser = mockUser as any;
      mockIndicatorService.getIndicators.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.getCRPIndicators();
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('groupCommentsChart', () => {
    it('should group chart data', () => {
      mockDashService.groupByProp.mockReturnValue({
        qa_test: [{ indicator_view_display: 'Test', comment_approved: '5', comment_rejected: '2' }],
      });
      const result = component.groupCommentsChart([]);
      expect(result).toHaveLength(1);
      expect(result[0].series).toHaveLength(2);
    });
  });

  describe('getPendingResponseComments', () => {
    it('should return pending count when secondary found', () => {
      const data = [{ type: 'secondary', comments_without_answer: '5' }];
      const result = component.getPendingResponseComments(data);
      expect(result).toContain('5');
    });

    it('should return all responded when no secondary', () => {
      const data = [{ type: 'primary', comments_without_answer: '0' }];
      const result = component.getPendingResponseComments(data);
      expect(result).toBe('all responded');
    });
  });

  describe('findObjectByKey', () => {
    it('should find object by key value', () => {
      const arr = [{ type: 'a' }, { type: 'b' }];
      expect(component.findObjectByKey(arr, 'type', 'b')).toEqual({ type: 'b' });
    });

    it('should return null when not found', () => {
      const arr = [{ type: 'a' }];
      expect(component.findObjectByKey(arr, 'type', 'c')).toBeNull();
    });
  });

  describe('isDashboardDataEmpty', () => {
    it('should return true for null', () => {
      component.dashboardData = null;
      expect(component.isDashboardDataEmpty()).toBe(true);
    });

    it('should return true for empty object', () => {
      component.dashboardData = {} as any;
      expect(component.isDashboardDataEmpty()).toBe(true);
    });

    it('should return false for data', () => {
      component.dashboardData = { key: 'value' } as any;
      expect(component.isDashboardDataEmpty()).toBe(false);
    });
  });

  describe('goToView', () => {
    it('should navigate', () => {
      component.goToView('innovation_development', 'id');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['crp/indicator/innovation_development/id']);
    });
  });

  describe('goToPendingItems', () => {
    it('should navigate to indicator and set order', () => {
      component.goToPendingItems('qa_knowledge_product');
      expect(mockIndicatorService.setOrderByStatus).toHaveBeenCalledWith(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['crp/indicator/knowledge_product/id']);
    });
  });

  describe('indicatorIsEnable', () => {
    it('should return enable_crp when indicator found', () => {
      component.indicators = [{ view_name: 'qa_test', comment_meta: { enable_crp: true } }] as any;
      expect(component.indicatorIsEnable('qa_test')).toBe(true);
    });

    it('should return undefined when indicator not found', () => {
      component.indicators = [] as any;
      expect(component.indicatorIsEnable('qa_test')).toBeUndefined();
    });

    it('should return falsy when ind is null', () => {
      expect(component.indicatorIsEnable(null)).toBeFalsy();
    });
  });

  describe('downloadRawComments', () => {
    it('should download and export', () => {
      component.currentUser = mockUser as any;
      component.downloadRawComments();
      expect(mockCommentService.getCommentsRawExcel).toHaveBeenCalledWith(5);
    });

    it('should append .xlsx for Safari', () => {
      mockAuthService.getBrowser.mockReturnValue('Safari');
      component.currentUser = mockUser as any;
      component.downloadRawComments();
      expect(mockCommentService.getCommentsRawExcel).toHaveBeenCalled();
    });

    it('should handle error', () => {
      component.currentUser = mockUser as any;
      mockCommentService.getCommentsRawExcel.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.downloadRawComments();
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });
});
