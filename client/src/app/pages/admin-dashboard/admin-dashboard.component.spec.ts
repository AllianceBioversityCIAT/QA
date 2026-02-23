import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Title } from '@angular/platform-browser';
import { NgbCalendar, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import AdminDashboardComponent from './admin-dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import { AuthenticationService } from '../../services/authentication.service';
import { AlertService } from '../../services/alert.service';
import { IndicatorsService } from '../../services/indicators.service';
import { CommentService } from '../../services/comment.service';
import { ExportTablesService } from '../../services/export-tables.service';
import { createMockUser } from '../../test-helpers/mock-data';
import { GeneralStatus } from '../../_models/general-status.model';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let mockDashService: any;
  let mockAuthService: any;
  let mockSpinner: any;
  let mockCommentService: any;
  let mockIndicatorService: any;
  let mockAlertService: any;
  let mockRouter: any;
  let mockExportService: any;

  beforeEach(waitForAsync(() => {
    mockDashService = {
      getAllDashboardEvaluations: jest.fn().mockReturnValue(of({ data: {} })),
      getCRPS: jest.fn().mockReturnValue(of({ data: [] })),
      getIndicatorsByCRP: jest.fn().mockReturnValue(of({ data: [] })),
      groupData: jest.fn(d => d),
      groupByProp: jest.fn().mockReturnValue({}),
      getHighlightedData: jest.fn().mockReturnValue(of({ data: [] })),
    };
    mockAuthService = {
      currentUser: of(createMockUser()),
      currentUserValue: createMockUser(),
      getBrowser: jest.fn().mockReturnValue('Chrome'),
    };
    mockSpinner = { show: jest.fn(), hide: jest.fn() };
    mockCommentService = {
      getCommentCRPStats: jest.fn().mockReturnValue(of({ data: {} })),
      getCycles: jest.fn().mockReturnValue(of({ data: [] })),
      getAllTags: jest.fn().mockReturnValue(of({ data: [] })),
      getFeedTags: jest.fn().mockReturnValue(of({ data: [] })),
      groupTags: jest.fn().mockReturnValue({}),
      getRawComments: jest.fn().mockReturnValue(of({ data: [] })),
      getCommentsRawExcel: jest.fn().mockReturnValue(of({ data: [[], []] })),
      updateCycle: jest.fn().mockReturnValue(of({})),
    };
    mockIndicatorService = {
      getAllItemStatusByIndicator: jest.fn().mockReturnValue(of({ data: {} })),
      getItemStatusByIndicator: jest.fn().mockReturnValue(of({ data: {} })),
      updateIndicatorsByUser: jest.fn().mockReturnValue(of({})),
    };
    mockAlertService = { error: jest.fn() };
    mockRouter = { navigate: jest.fn() };
    mockExportService = { exportExcel: jest.fn(), exportMultipleSheetsExcel: jest.fn() };

    TestBed.configureTestingModule({
      imports: [AdminDashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}) } },
        { provide: DashboardService, useValue: mockDashService },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CommentService, useValue: mockCommentService },
        { provide: IndicatorsService, useValue: mockIndicatorService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: Router, useValue: mockRouter },
        { provide: Title, useValue: { setTitle: jest.fn() } },
        { provide: ExportTablesService, useValue: mockExportService },
        { provide: NgbCalendar, useValue: { isValid: jest.fn().mockReturnValue(true), getToday: jest.fn() } },
        { provide: NgbDateParserFormatter, useValue: { parse: jest.fn(), format: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AdminDashboardComponent, { set: { imports: [], template: '' } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formatStatusIndicatorData', () => {
    it('should return null when data is null', () => {
      const result = component.formatStatusIndicatorData(null);
      expect(result).toBeNull();
      expect(component.isDataNull).toBe(true);
    });

    it('should format data with all status types', () => {
      const data = [
        { status: 'pending', label: '10' },
        { status: 'complete', label: '5' },
        { status: 'finalized', label: '3' },
        { status: 'autochecked', label: '2' },
      ];
      const result = component.formatStatusIndicatorData(data);
      expect(result).toBeTruthy();
      expect(result.dataset).toHaveLength(4);
      expect(result.dataset.find((d: any) => d.name === 'Pending')).toBeTruthy();
      expect(result.dataset.find((d: any) => d.name === 'Assessed 1st round')).toBeTruthy();
      expect(result.dataset.find((d: any) => d.name === 'Quality Assessed')).toBeTruthy();
      expect(result.dataset.find((d: any) => d.name === 'Automatically validated')).toBeTruthy();
      expect(component.indicator_status).toBe('publications_status');
      expect(component.isDataNull).toBe(false);
    });

    it('should set indicator_status to indicator_status when no autochecked', () => {
      const data = [{ status: 'pending', label: '10' }, { status: 'complete', label: '5' }];
      component.formatStatusIndicatorData(data);
      expect(component.indicator_status).toBe('indicator_status');
    });

    it('should skip items with null status', () => {
      const data = [{ status: null, label: '10' }, { status: 'pending', label: '5' }];
      const result = component.formatStatusIndicatorData(data);
      expect(result.dataset).toHaveLength(1);
    });

    it('should handle data with only finalized status', () => {
      const data = [{ status: 'finalized', label: '10' }];
      const result = component.formatStatusIndicatorData(data);
      expect(result.dataset[0].name).toBe('Quality Assessed');
    });
  });

  describe('formatCommentsIndicatorData', () => {
    it('should return empty dataset when data is null', () => {
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

    it('should skip comments with value 0', () => {
      const data = [
        { comments_accepted_with_comment: '0', comments_accepted_without_comment: '0', comments_rejected: '0', comments_clarification: '0', comments_without_answer: '0', value: '0' },
      ];
      const result = component.formatCommentsIndicatorData(data);
      expect(result.dataset).toEqual([]);
    });

    it('should handle only accepted comments', () => {
      const data = [{ comments_accepted_with_comment: '0', comments_accepted_without_comment: '3', comments_rejected: '0', comments_clarification: '0', comments_without_answer: '0', value: '3' }];
      const result = component.formatCommentsIndicatorData(data);
      expect(result.dataset).toHaveLength(1);
      expect(result.dataset[0].name).toBe('Accepted');
    });

    it('should handle only rejected comments', () => {
      const data = [{ comments_accepted_with_comment: '0', comments_accepted_without_comment: '0', comments_rejected: '2', comments_clarification: '0', comments_without_answer: '0', value: '2' }];
      const result = component.formatCommentsIndicatorData(data);
      expect(result.dataset[0].name).toBe('Disagree');
    });

    it('should handle only clarification comments', () => {
      const data = [{ comments_accepted_with_comment: '0', comments_accepted_without_comment: '0', comments_rejected: '0', comments_clarification: '1', comments_without_answer: '0', value: '1' }];
      const result = component.formatCommentsIndicatorData(data);
      expect(result.dataset[0].name).toBe('Clarification');
    });
  });

  describe('formatDate', () => {
    it('should return empty string when date is null', () => {
      expect(component.formatDate(null as any)).toBe('');
    });

    it('should format a valid NgbDate', () => {
      const date = new NgbDate(2024, 6, 15);
      const result = component.formatDate(date);
      expect(result).not.toBe('');
    });
  });

  describe('onDateSelection', () => {
    beforeEach(() => {
      component.currenTcycle = { start_date: null, end_date: null };
    });

    it('should set fromDate when both are null', () => {
      component.fromDate = null;
      component.toDate = null;
      const date = new NgbDate(2024, 6, 15);
      component.onDateSelection(date);
      expect(component.fromDate).toEqual(date);
    });

    it('should set toDate when fromDate exists and date is after', () => {
      component.fromDate = new NgbDate(2024, 6, 10);
      component.toDate = null;
      const date = new NgbDate(2024, 6, 20);
      component.onDateSelection(date);
      expect(component.toDate).toEqual(date);
    });

    it('should reset fromDate when date is before fromDate', () => {
      component.fromDate = new NgbDate(2024, 6, 10);
      component.toDate = null;
      const date = new NgbDate(2024, 6, 5);
      component.onDateSelection(date);
      expect(component.fromDate).toEqual(date);
      expect(component.toDate).toBeNull();
    });

    it('should reset when both exist', () => {
      component.fromDate = new NgbDate(2024, 6, 10);
      component.toDate = new NgbDate(2024, 6, 20);
      const date = new NgbDate(2024, 7, 1);
      component.onDateSelection(date);
      expect(component.fromDate).toEqual(date);
      expect(component.toDate).toBeNull();
    });
  });

  describe('updateConfig', () => {
    it('should call updateIndicatorsByUser for enableQA', () => {
      component.updateConfig('enableQA', 1, true);
      expect(mockIndicatorService.updateIndicatorsByUser).toHaveBeenCalledWith(1, { enable: 'enable_assessor', isActive: true });
    });

    it('should call updateIndicatorsByUser for enableCRP', () => {
      component.updateConfig('enableCRP', 2, false);
      expect(mockIndicatorService.updateIndicatorsByUser).toHaveBeenCalledWith(2, { enable: 'enable_crp', isActive: false });
    });

    it('should handle error', () => {
      mockIndicatorService.updateIndicatorsByUser.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.updateConfig('enableQA', 1, true);
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('onProgramChange', () => {
    beforeEach(() => {
      component.currenTcycle = { cycle_stage: '1' };
      component.dashboardData = {} as any;
      component.selectedIndicator = 'qa_knowledge_product';
      component.dashboardCommentsData = {} as any;
      component.indicatorsTags = {};
    });

    it('should set selectedProg to All when value is null', () => {
      mockDashService.groupData.mockImplementation(d => d || {});
      component.onProgramChange({ target: {} }, null);
      expect(component.selectedProg).toBe('All');
    });

    it('should set selectedProgramName from acronym', () => {
      component.onProgramChange({ target: {} }, { crp_id: 1, acronym: 'CRP1', name: 'Research 1' });
      expect(component.selectedProgramName).toBe('CRP1');
    });

    it('should use name when acronym is empty', () => {
      component.onProgramChange({ target: {} }, { crp_id: 1, acronym: '', name: 'Full Name' });
      expect(component.selectedProgramName).toBe('Full Name');
    });

    it('should use name when acronym is space', () => {
      component.onProgramChange({ target: {} }, { crp_id: 1, acronym: ' ', name: 'Full Name' });
      expect(component.selectedProgramName).toBe('Full Name');
    });

    it('should handle cycle_stage 2', () => {
      component.currenTcycle = { cycle_stage: '2' };
      component.onProgramChange({ target: {} }, { crp_id: 1, acronym: 'CRP', name: 'CRP' });
      expect(mockDashService.getAllDashboardEvaluations).toHaveBeenCalled();
    });

    it('should handle error in forkJoin', () => {
      component.currenTcycle = { cycle_stage: '1' };
      mockDashService.getAllDashboardEvaluations.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.onProgramChange({ target: {} }, { crp_id: 1, acronym: 'C', name: 'C' });
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('getPendings', () => {
    it('should return empty for All', () => {
      expect(component.getPendings({ acronym: 'All', qa_active: GeneralStatus.Open })).toBe('');
    });

    it('should return Open for active', () => {
      expect(component.getPendings({ acronym: 'CRP1', qa_active: GeneralStatus.Open })).toBe('- Open');
    });

    it('should return Pending for inactive', () => {
      expect(component.getPendings({ acronym: 'CRP1', qa_active: GeneralStatus.Close })).toBe('- Pending');
    });
  });

  describe('goToView', () => {
    it('should navigate', () => {
      component.goToView('QA_TEST', 'id');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['indicator', 'qa_test', 'id']);
    });
  });

  describe('actualStatusIndicator', () => {
    it('should return true when indicator_status=1', () => {
      expect(component.actualStatusIndicator([{ indicator_status: 1 }])).toBe(true);
    });

    it('should return false when no indicator_status=1', () => {
      expect(component.actualStatusIndicator([{ indicator_status: 0 }])).toBe(false);
    });

    it('should return false when data is null', () => {
      expect(component.actualStatusIndicator(null)).toBe(false);
    });
  });

  describe('getItemStatusByIndicator', () => {
    it('should return data for existing indicator', () => {
      component.itemStatusByIndicator = { qa_test: [{ field: 'data' }] };
      expect(component.getItemStatusByIndicator('qa_test')).toEqual([{ field: 'data' }]);
    });

    it('should return false for missing indicator', () => {
      component.itemStatusByIndicator = {};
      expect(component.getItemStatusByIndicator('missing')).toBe(false);
    });
  });

  describe('isChecked', () => {
    it('should return enable_assessor for enableQA', () => {
      expect(component.isChecked({ enable_assessor: true, enable_crp: false }, 'enableQA')).toBe(true);
    });

    it('should return enable_crp for enableCRP', () => {
      expect(component.isChecked({ enable_assessor: true, enable_crp: false }, 'enableCRP')).toBe(false);
    });
  });

  describe('groupCommentsChart', () => {
    it('should group data', () => {
      mockDashService.groupByProp.mockReturnValue({
        qa_test: [{ indicator_view_display: 'Test', comment_approved: '5', comment_rejected: '2' }],
      });
      const result = component.groupCommentsChart([]);
      expect(result).toHaveLength(1);
      expect(result[0].series).toHaveLength(2);
    });
  });

  describe('downloadRawComments', () => {
    it('should download with CRP acronym', () => {
      component.selectedProg = { crp_id: 1, acronym: 'CRP1' };
      component.downloadRawComments();
      expect(mockExportService.exportMultipleSheetsExcel).toHaveBeenCalled();
    });

    it('should append .xlsx for Safari', () => {
      mockAuthService.getBrowser.mockReturnValue('Safari');
      component.selectedProg = { crp_id: 1, acronym: 'Test' };
      component.downloadRawComments();
      expect(mockExportService.exportMultipleSheetsExcel).toHaveBeenCalled();
    });

    it('should handle error', () => {
      mockCommentService.getCommentsRawExcel.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.selectedProg = { crp_id: 1 };
      component.downloadRawComments();
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('goToPDF', () => {
    it('should open AR pdf', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      component.currentUser = createMockUser({ config: [{ anual_report_guideline: 'http://test.pdf' }] }) as any;
      component.goToPDF('AR');
      expect(openSpy).toHaveBeenCalledWith('http://test.pdf', '_blank');
      openSpy.mockRestore();
    });

    it('should open ASSESSORS_GUIDANCE pdf', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      component.currentUser = createMockUser({ config: [{ assessors_guideline: 'http://guide.pdf' }] }) as any;
      component.goToPDF('ASSESSORS_GUIDANCE');
      expect(openSpy).toHaveBeenCalledWith('http://guide.pdf', '_blank');
      openSpy.mockRestore();
    });

    it('should handle default case', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      component.currentUser = createMockUser({ config: [{}] }) as any;
      component.goToPDF('UNKNOWN');
      expect(openSpy).toHaveBeenCalledWith(undefined, '_blank');
      openSpy.mockRestore();
    });
  });

  describe('parseCycleDates', () => {
    it('should parse and identify active cycle', () => {
      const now = new Date();
      const data = [
        { start_date: new Date(now.getFullYear() - 1, 0, 1).toISOString(), end_date: new Date(now.getFullYear() + 1, 11, 31).toISOString() },
      ];
      const result = component.parseCycleDates(data);
      expect(result[0].start_date).toHaveProperty('year');
      expect(result[0].is_active).toBe(true);
    });

    it('should handle inactive cycles', () => {
      const data = [{ start_date: '2020-01-01', end_date: '2020-12-31' }];
      const result = component.parseCycleDates(data);
      expect(result[0].is_active).toBe(false);
    });
  });

  describe('toggleAssessorsChat', () => {
    it('should toggle', () => {
      component.assessorsChat.isOpen = false;
      component.toggleAssessorsChat();
      expect(component.assessorsChat.isOpen).toBe(true);
    });
  });

  describe('toggleSideMenu', () => {
    it('should toggle', () => {
      component.showSideMenu = false;
      component.toggleSideMenu();
      expect(component.showSideMenu).toBe(true);
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

  describe('actualChatIndicator', () => {
    it('should set only selected to true', () => {
      component.actualChatIndicator('qa_capdev');
      expect(component.assessorsChat.indicators['qa_capdev']).toBe(true);
      expect(component.assessorsChat.indicators['qa_knowledge_product']).toBe(false);
    });
  });

  describe('isHovered', () => {
    it('should return true when between fromDate and hoveredDate', () => {
      component.fromDate = new NgbDate(2024, 6, 10);
      component.toDate = null;
      component.hoveredDate = new NgbDate(2024, 6, 20);
      expect(component.isHovered(new NgbDate(2024, 6, 15))).toBe(true);
    });

    it('should return false when toDate exists', () => {
      component.fromDate = new NgbDate(2024, 6, 10);
      component.toDate = new NgbDate(2024, 6, 20);
      component.hoveredDate = new NgbDate(2024, 6, 25);
      expect(component.isHovered(new NgbDate(2024, 6, 15))).toBeFalsy();
    });
  });

  describe('isInside', () => {
    it('should return true when between fromDate and toDate', () => {
      component.fromDate = new NgbDate(2024, 6, 10);
      component.toDate = new NgbDate(2024, 6, 20);
      expect(component.isInside(new NgbDate(2024, 6, 15))).toBe(true);
    });

    it('should return false when no toDate', () => {
      component.toDate = null;
      component.fromDate = new NgbDate(2024, 6, 10);
      expect(component.isInside(new NgbDate(2024, 6, 15))).toBeFalsy();
    });
  });

  describe('isRange', () => {
    it('should return true when date equals fromDate', () => {
      component.fromDate = new NgbDate(2024, 6, 10);
      component.toDate = null;
      component.hoveredDate = null;
      expect(component.isRange(new NgbDate(2024, 6, 10))).toBe(true);
    });

    it('should return true when date equals toDate', () => {
      component.fromDate = new NgbDate(2024, 6, 10);
      component.toDate = new NgbDate(2024, 6, 20);
      expect(component.isRange(new NgbDate(2024, 6, 20))).toBe(true);
    });
  });
});
