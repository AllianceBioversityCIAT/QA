import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Title } from '@angular/platform-browser';

import AssessorDashboardComponent from './assessor-dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import { AuthenticationService } from '../../services/authentication.service';
import { AlertService } from '../../services/alert.service';
import { IndicatorsService } from '../../services/indicators.service';
import { CommentService } from '../../services/comment.service';
import { UsersService } from '../../services/users.service';
import { ExportTablesService } from '../../services/export-tables.service';
import { createMockAssessorUser } from '../../test-helpers/mock-data';

describe('AssessorDashboardComponent', () => {
  let component: AssessorDashboardComponent;
  let fixture: ComponentFixture<AssessorDashboardComponent>;
  let mockDashService: any;
  let mockAuthService: any;
  let mockCommentService: any;
  let mockIndicatorService: any;
  let mockAlertService: any;
  let mockUsersService: any;
  let mockRouter: any;
  let mockExportService: any;

  const mockUser = createMockAssessorUser({ id: 1, indicators: [{ isTPB: false }], cycle: { id: 1 } });

  beforeEach(waitForAsync(() => {
    mockDashService = {
      getDashboardEvaluations: jest.fn().mockReturnValue(of({ data: {} })),
      groupData: jest.fn(d => d),
      groupByProp: jest.fn().mockReturnValue({}),
      getHighlightedData: jest.fn().mockReturnValue(of({ data: [] })),
    };
    mockAuthService = {
      currentUser: of(mockUser),
      currentUserValue: mockUser,
      getBrowser: jest.fn().mockReturnValue('Chrome'),
      parseUpdateIndicators: jest.fn(),
    };
    mockCommentService = {
      getCommentCRPStats: jest.fn().mockReturnValue(of({ data: {} })),
      getAllTags: jest.fn().mockReturnValue(of({ data: [] })),
      getFeedTags: jest.fn().mockReturnValue(of({ data: [] })),
      groupTags: jest.fn().mockReturnValue({}),
      getCommentsRawExcel: jest.fn().mockReturnValue(of({ data: [[], []] })),
    };
    mockIndicatorService = {
      getAllItemStatusByIndicator: jest.fn().mockReturnValue(of({ data: {} })),
      getItemStatusByIndicator: jest.fn().mockReturnValue(of({ data: {} })),
      getActionAreas: jest.fn().mockReturnValue(of({ data: [] })),
    };
    mockAlertService = { error: jest.fn() };
    mockUsersService = { getUserById: jest.fn().mockReturnValue(of({ data: { indicators: [] } })) };
    mockRouter = { navigate: jest.fn() };
    mockExportService = { exportExcel: jest.fn(), exportMultipleSheetsExcel: jest.fn() };

    TestBed.configureTestingModule({
      imports: [AssessorDashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}) } },
        { provide: DashboardService, useValue: mockDashService },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: NgxSpinnerService, useValue: { show: jest.fn(), hide: jest.fn() } },
        { provide: CommentService, useValue: mockCommentService },
        { provide: IndicatorsService, useValue: mockIndicatorService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: Router, useValue: mockRouter },
        { provide: Title, useValue: { setTitle: jest.fn() } },
        { provide: ExportTablesService, useValue: mockExportService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AssessorDashboardComponent, { set: { imports: [], template: '' } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessorDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formatStatusIndicatorData', () => {
    it('should return null when data is null', () => {
      expect(component.formatStatusIndicatorData(null)).toBeNull();
      expect(component.isDataNull).toBe(true);
    });

    it('should format all status types', () => {
      const data = [
        { status: 'pending', label: '10' },
        { status: 'complete', label: '5' },
        { status: 'finalized', label: '3' },
        { status: 'autochecked', label: '2' },
      ];
      const result = component.formatStatusIndicatorData(data);
      expect(result.dataset).toHaveLength(4);
      expect(result.dataset.find((d: any) => d.name === 'Automatically validated')).toBeTruthy();
      expect(component.indicator_status).toBe('publications_status');
    });

    it('should set indicator_status without autochecked', () => {
      const data = [{ status: 'pending', label: '10' }];
      component.formatStatusIndicatorData(data);
      expect(component.indicator_status).toBe('indicator_status');
    });

    it('should skip null status items', () => {
      const data = [{ status: null, label: '10' }, { status: 'pending', label: '5' }];
      const result = component.formatStatusIndicatorData(data);
      expect(result.dataset).toHaveLength(1);
    });
  });

  describe('formatCommentsIndicatorData', () => {
    it('should return empty for null data', () => {
      const result = component.formatCommentsIndicatorData(null);
      expect(result.dataset).toEqual([]);
    });

    it('should format all comment types', () => {
      const base = { comments_accepted_with_comment: '0', comments_accepted_without_comment: '0', comments_rejected: '0', comments_clarification: '0', comments_without_answer: '0' };
      const data = [
        { ...base, comments_accepted_with_comment: '5', value: '5' },
        { ...base, comments_accepted_without_comment: '3', value: '3' },
        { ...base, comments_rejected: '2', value: '2' },
        { ...base, comments_clarification: '1', value: '1' },
        { ...base, comments_without_answer: '4', value: '4' },
      ];
      const result = component.formatCommentsIndicatorData(data, 'qa_knowledge_product');
      expect(result.dataset.length).toBe(5);
      expect(component.totalPendings['qa_knowledge_product']).toBe(4);
    });

    it('should skip zero values', () => {
      const data = [{ comments_accepted_with_comment: '0', comments_accepted_without_comment: '0', comments_rejected: '0', comments_clarification: '0', comments_without_answer: '0', value: '0' }];
      const result = component.formatCommentsIndicatorData(data);
      expect(result.dataset).toEqual([]);
    });
  });

  describe('getHighlightData', () => {
    it('should format highlight data', () => {
      const data = { pending_highlight_comments: '5', solved_with_require_request: '3', solved_without_require_request: '2' };
      const result = component.getHighlightData(data);
      expect(result.dataset).toHaveLength(3);
      expect(result.dataset[0].name).toBe('Pending');
    });

    it('should return empty for undefined data', () => {
      const result = component.getHighlightData(undefined);
      expect(result.dataset).toEqual([]);
    });

    it('should return empty for string undefined', () => {
      const result = component.getHighlightData('undefined');
      expect(result.dataset).toEqual([]);
    });
  });

  describe('actualIndicator', () => {
    beforeEach(() => {
      component.dashboardData = { qa_test: [{ status: 'pending', label: '5' }] } as any;
      component.dashboardCommentsData = {} as any;
      component.indicatorsTags = {};
      component.highlightedData = [];
    });

    it('should handle string indicator', () => {
      component.actualIndicator('qa_test');
      expect(component.selectedIndicator).toBe('qa_test');
    });

    it('should handle object with viewname', () => {
      component.actualIndicator({ viewname: 'qa_test' });
      expect(component.selectedIndicator).toBe('qa_test');
    });

    it('should handle null/falsy indicator', () => {
      const prev = component.selectedIndicator;
      component.actualIndicator(null);
      expect(component.selectedIndicator).toBe(prev);
    });
  });

  describe('actualStatusIndicator', () => {
    it('should return true when indicator_status=1', () => {
      expect(component.actualStatusIndicator([{ indicator_status: 1 }])).toBe(true);
    });

    it('should return false for no match', () => {
      expect(component.actualStatusIndicator([{ indicator_status: 0 }])).toBe(false);
    });

    it('should return false for null', () => {
      expect(component.actualStatusIndicator(null)).toBe(false);
    });
  });

  describe('getItemStatusByIndicator', () => {
    it('should return data for existing key', () => {
      component.itemStatusByIndicator = { qa_test: 'data' };
      expect(component.getItemStatusByIndicator('qa_test')).toBe('data');
    });

    it('should return false for missing key', () => {
      component.itemStatusByIndicator = {};
      expect(component.getItemStatusByIndicator('missing')).toBe(false);
    });
  });

  describe('goToView', () => {
    it('should navigate', () => {
      component.goToView('QA_TEST', 'id');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['indicator', 'qa_test', 'id']);
    });
  });

  describe('downloadRawComments', () => {
    it('should download and export', () => {
      component.downloadRawComments();
      expect(mockExportService.exportMultipleSheetsExcel).toHaveBeenCalled();
    });

    it('should append .xlsx for Safari', () => {
      mockAuthService.getBrowser.mockReturnValue('Safari');
      component.downloadRawComments();
      expect(mockExportService.exportMultipleSheetsExcel).toHaveBeenCalled();
    });

    it('should handle error', () => {
      mockCommentService.getCommentsRawExcel.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.downloadRawComments();
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('goToPDF', () => {
    it('should open AR pdf', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      component.currentUser = { config: [{ anual_report_guideline: 'http://ar.pdf' }] } as any;
      component.goToPDF('AR');
      expect(openSpy).toHaveBeenCalledWith('http://ar.pdf', '_blank');
      openSpy.mockRestore();
    });

    it('should open ASSESSORS_GUIDANCE pdf', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      component.currentUser = { config: [{ assessors_guideline: 'http://g.pdf' }] } as any;
      component.goToPDF('ASSESSORS_GUIDANCE');
      expect(openSpy).toHaveBeenCalledWith('http://g.pdf', '_blank');
      openSpy.mockRestore();
    });

    it('should handle default case', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      component.currentUser = { config: [{}] } as any;
      component.goToPDF('UNKNOWN');
      expect(openSpy).toHaveBeenCalledWith(undefined, '_blank');
      openSpy.mockRestore();
    });
  });

  describe('formatIndicatorTags', () => {
    it('should format tags', () => {
      component.indicatorsTags = { qa_knowledge_product: { agree: 5, disagree: 2 } };
      component.selectedIndicator = 'qa_knowledge_product';
      const result = component.formatIndicatorTags();
      expect(result.dataset).toHaveLength(2);
    });
  });

  describe('getIstpbUser', () => {
    it('should set istpbUser to true when found', () => {
      component.currentUser = { indicators: [{ isTPB: true }] } as any;
      component.getIstpbUser();
      expect(component.istpbUser()).toBe(true);
    });

    it('should set istpbUser to false when not found', () => {
      component.currentUser = { indicators: [{ isTPB: false }] } as any;
      component.getIstpbUser();
      expect(component.istpbUser()).toBe(false);
    });

    it('should set istpbUser to false when indicators empty', () => {
      component.currentUser = { indicators: [] } as any;
      component.getIstpbUser();
      expect(component.istpbUser()).toBe(false);
    });
  });
});
