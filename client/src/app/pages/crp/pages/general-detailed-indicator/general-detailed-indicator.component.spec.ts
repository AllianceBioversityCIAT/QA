import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Title } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import GeneralDetailedIndicatorComponent from './general-detailed-indicator.component';
import { EvaluationsService } from '../../../../services/evaluations.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { AlertService } from '../../../../services/alert.service';
import { CommentService } from '../../../../services/comment.service';
import { ExportTablesService } from '../../../../services/export-tables.service';
import { createMockUser, createMockAssessorUser } from '../../../../test-helpers/mock-data';
import { DetailedStatus } from '../../../../_models/general-status.model';

describe('GeneralDetailedIndicatorComponent', () => {
  let component: GeneralDetailedIndicatorComponent;
  let fixture: ComponentFixture<GeneralDetailedIndicatorComponent>;
  let mockEvalService: any;
  let mockAuthService: any;
  let mockAlertService: any;
  let mockCommentService: any;
  let mockSpinner: any;
  let mockExportService: any;
  let mockRouter: any;

  const mockUser = createMockUser({
    id: 1,
    username: 'testuser',
    name: 'Test User',
    indicators: [
      { isTPB: false, isLeader: true, indicator: { view_name: 'qa_knowledge_product' } },
    ],
    config: [{ roleId: 1 }],
  });

  const mockDetailedData = [
    {
      evaluation_id: '100',
      field_id: 'f1',
      display_name: 'Title',
      col_name: 'title',
      value: 'Test Value',
      status: 'pending',
      evaluation_status: 'open',
      general_comment: 'A comment',
      general_comment_id: '10',
      general_comment_user: 'admin',
      general_comment_updatedAt: '2024-01-01',
      require_second_assessment: false,
      is_highlight: '',
      approved_no_comment: false,
      enable_comments: true,
      enable_assessor: true,
      replies_count: '0',
      result_code: 'RC001',
      version: '1',
      crp_acronym: 'CRP1',
    },
    {
      evaluation_id: '100',
      field_id: 'f2',
      display_name: 'Description',
      col_name: 'description',
      value: 'Some description',
      status: 'pending',
      evaluation_status: 'open',
      general_comment: null,
      general_comment_id: null,
      general_comment_user: null,
      general_comment_updatedAt: null,
      require_second_assessment: false,
      is_highlight: '',
      approved_no_comment: true,
      enable_comments: true,
      enable_assessor: true,
      replies_count: '2',
      result_code: 'RC001',
      version: '1',
      crp_acronym: 'CRP1',
    },
  ];

  beforeEach(waitForAsync(() => {
    mockEvalService = {
      getDataEvaluation: jest.fn().mockReturnValue(of({ data: mockDetailedData })),
      updateDataEvaluation: jest.fn().mockReturnValue(of({ message: 'Updated' })),
      getAssessorsByEvaluation: jest.fn().mockReturnValue(of({ data: { assessed_r1: ['testuser'], assessed_r2: null } })),
      getCriteriaByIndicator: jest.fn().mockReturnValue(of({ data: [{ id: 1 }] })),
      updateRequireSecondAssessmentEvaluation: jest.fn().mockReturnValue(of({})),
      getEvaluationStatus: jest.fn().mockReturnValue(of({ data: [{ status: 'pending' }] })),
    };
    mockAuthService = {
      currentUser: of(mockUser),
      currentUserValue: mockUser,
      NOT_APPLICABLE: '<Not applicable>',
    };
    mockAlertService = { error: jest.fn(), success: jest.fn() };
    mockCommentService = {
      updateDataComment: jest.fn().mockReturnValue(of({ message: 'Updated' })),
      createDataComment: jest.fn().mockReturnValue(of({ message: 'Created' })),
      getCommentsExcel: jest.fn().mockReturnValue(of({ data: [{ col: 'val' }] })),
      getDataCommentReply: jest.fn().mockReturnValue(of({ data: [] })),
      toggleApprovedNoComments: jest.fn().mockReturnValue(of({})),
      refresh$: of(null),
      patchHighlightComment: jest.fn().mockReturnValue(of({ message: 'ok' })),
    };
    mockSpinner = { show: jest.fn(), hide: jest.fn() };
    mockExportService = { exportExcel: jest.fn() };
    mockRouter = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      imports: [GeneralDetailedIndicatorComponent, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({ type: 'knowledge_product', indicatorId: '123' }), snapshot: { queryParamMap: { get: jest.fn().mockReturnValue(null) } } } },
        { provide: EvaluationsService, useValue: mockEvalService },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: AlertService, useValue: mockAlertService },
        { provide: CommentService, useValue: mockCommentService },
        { provide: ExportTablesService, useValue: mockExportService },
        { provide: Router, useValue: mockRouter },
        { provide: Title, useValue: { setTitle: jest.fn() } },
        FormBuilder,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(GeneralDetailedIndicatorComponent, { set: { imports: [], template: '', animations: [] } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralDetailedIndicatorComponent);
    component = fixture.componentInstance;
    component.currentUser = mockUser as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('validateCommentAvility', () => {
    it('should return true for admin when enable_comments is true', () => {
      component.currentUser = createMockUser({ roles: [{ description: 'ADMIN' }] }) as any;
      const field = { enable_comments: true };
      expect(component.validateCommentAvility(field)).toBe(true);
    });

    it('should return false for admin when enable_comments is false', () => {
      component.currentUser = createMockUser({ roles: [{ description: 'ADMIN' }] }) as any;
      const field = { enable_comments: false };
      expect(component.validateCommentAvility(field)).toBe(false);
    });

    it('should return true for assessor when enable_assessor and enable_comments are true', () => {
      component.currentUser = createMockAssessorUser() as any;
      component.gnralInfo.status = DetailedStatus.Pending;
      const field = { enable_assessor: true, enable_comments: true };
      expect(component.validateCommentAvility(field)).toBe(true);
    });

    it('should return false for assessor when enable_assessor is false', () => {
      component.currentUser = createMockAssessorUser() as any;
      component.gnralInfo.status = DetailedStatus.Pending;
      const field = { enable_assessor: false, enable_comments: true };
      expect(component.validateCommentAvility(field)).toBe(false);
    });

    it('should return false for assessor when enable_comments is false', () => {
      component.currentUser = createMockAssessorUser() as any;
      component.gnralInfo.status = DetailedStatus.Complete;
      const field = { enable_assessor: true, enable_comments: false };
      expect(component.validateCommentAvility(field)).toBe(false);
    });

    it('should return false for unknown role (default case)', () => {
      component.currentUser = createMockUser({ roles: [{ description: 'GUEST' }] }) as any;
      const field = { enable_comments: true };
      expect(component.validateCommentAvility(field)).toBe(false);
    });
  });

  describe('updateEvaluation', () => {
    it('should update status type', () => {
      component.gnralInfo.status_update = DetailedStatus.Complete;
      const data = [{ evaluation_id: '100', status: 'pending' }];
      component.updateEvaluation('status', data);
      expect(mockEvalService.updateDataEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({ status: DetailedStatus.Complete }),
        '100'
      );
    });

    it('should set finalized status', () => {
      const data = [{ evaluation_id: '100', status: 'pending' }];
      component.updateEvaluation('finalized', data);
      expect(mockEvalService.updateDataEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({ status: DetailedStatus.Finalized }),
        '100'
      );
    });

    it('should set complete status', () => {
      const data = [{ evaluation_id: '100', status: 'pending' }];
      component.updateEvaluation('complete', data);
      expect(mockEvalService.updateDataEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({ status: DetailedStatus.Complete }),
        '100'
      );
    });

    it('should set pending status', () => {
      const data = [{ evaluation_id: '100', status: 'complete' }];
      component.updateEvaluation('pending', data);
      expect(mockEvalService.updateDataEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({ status: DetailedStatus.Pending }),
        '100'
      );
    });

    it('should handle default case (no status change)', () => {
      const data = [{ evaluation_id: '100', status: 'pending' }];
      component.updateEvaluation('unknown', data);
      expect(mockEvalService.updateDataEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending' }),
        '100'
      );
    });

    it('should handle error', () => {
      mockEvalService.updateDataEvaluation.mockReturnValueOnce(throwError(() => new Error('fail')));
      const data = [{ evaluation_id: '100', status: 'pending' }];
      component.updateEvaluation('status', data);
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('parseGeneralStatus', () => {
    it('should parse Pending', () => {
      expect(component.parseGeneralStatus(DetailedStatus.Pending)).toBe('Pending');
    });

    it('should parse Autochecked', () => {
      expect(component.parseGeneralStatus(DetailedStatus.Autochecked)).toBe('Automatically Validated');
    });

    it('should parse Complete', () => {
      expect(component.parseGeneralStatus(DetailedStatus.Complete)).toBe('Assessed 1st round');
    });

    it('should parse Finalized', () => {
      expect(component.parseGeneralStatus(DetailedStatus.Finalized)).toBe('Assessed 2nd round');
    });

    it('should return undefined for unknown status', () => {
      expect(component.parseGeneralStatus('unknown')).toBeUndefined();
    });
  });

  describe('addGeneralComment', () => {
    beforeEach(() => {
      component.gnralInfo.evaluation_id = '100';
      component.generalCommentGroup.patchValue({ general_comment: 'test comment' });
    });

    it('should update existing comment', () => {
      const data = [{ general_comment: 'existing', general_comment_id: '10' }];
      component.addGeneralComment('test', data);
      expect(mockCommentService.updateDataComment).toHaveBeenCalled();
    });

    it('should create new comment when general_comment is null', () => {
      const data = [{ general_comment: null, general_comment_id: null }];
      component.addGeneralComment('test', data);
      expect(mockCommentService.createDataComment).toHaveBeenCalled();
    });

    it('should handle error', () => {
      mockCommentService.updateDataComment.mockReturnValueOnce(throwError(() => new Error('fail')));
      const data = [{ general_comment: 'existing', general_comment_id: '10' }];
      component.addGeneralComment('test', data);
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('verifyIsLeadAssessor', () => {
    it('should return true when user is leader for indicator type', () => {
      component.indicatorType = 'knowledge_product';
      component.currentUser = createMockUser({
        indicators: [{ isLeader: true, indicator: { view_name: 'qa_knowledge_product' } }],
      }) as any;
      expect(component.verifyIsLeadAssessor()).toBe(true);
    });

    it('should return false when user is not leader', () => {
      component.indicatorType = 'knowledge_product';
      component.currentUser = createMockUser({
        indicators: [{ isLeader: false, indicator: { view_name: 'qa_knowledge_product' } }],
      }) as any;
      expect(component.verifyIsLeadAssessor()).toBe(false);
    });

    it('should return false when indicator type does not match', () => {
      component.indicatorType = 'policy_change';
      component.currentUser = createMockUser({
        indicators: [{ isLeader: true, indicator: { view_name: 'qa_knowledge_product' } }],
      }) as any;
      expect(component.verifyIsLeadAssessor()).toBe(false);
    });
  });

  describe('istpbUser', () => {
    it('should set user to found element when isTPB is true', () => {
      component.currentUser = createMockUser({
        indicators: [{ isTPB: true }],
      }) as any;
      component.istpbUser();
      expect(component.user).toBeTruthy();
    });

    it('should set user to undefined when no TPB found', () => {
      component.currentUser = createMockUser({
        indicators: [{ isTPB: false }],
      }) as any;
      component.istpbUser();
      expect(component.user).toBeUndefined();
    });
  });

  describe('getCurrentTypeUrl', () => {
    it('should return ipsr URL for innovation_use_ipsr', () => {
      component.params = { type: 'innovation_use_ipsr' };
      component.prUrl = 'https://pr.example.com/';
      component.detailedData = [{ result_code: 'RC001', version: '1' }];
      const url = component.getCurrentTypeUrl();
      expect(url).toContain('ipsr/');
      expect(url).toContain('detail/');
      expect(url).toContain('RC001');
    });

    it('should return regular URL for non-ipsr type', () => {
      component.params = { type: 'knowledge_product' };
      component.prUrl = 'https://pr.example.com/';
      component.detailedData = [{ result_code: 'RC002', version: '2' }];
      const url = component.getCurrentTypeUrl();
      expect(url).toContain('result/');
      expect(url).toContain('result-detail/');
      expect(url).toContain('RC002');
      expect(url).toContain('phase=2');
    });
  });

  describe('getCommentsExcel', () => {
    beforeEach(() => {
      component.detailedData = mockDetailedData as any;
      component.params = { type: 'knowledge_product', indicatorId: '123' };
    });

    it('should export excel with data', () => {
      component.getCommentsExcel({ evaluation_id: '100' });
      expect(mockCommentService.getCommentsExcel).toHaveBeenCalled();
      expect(mockExportService.exportExcel).toHaveBeenCalled();
    });

    it('should show success message when no data', () => {
      mockCommentService.getCommentsExcel.mockReturnValueOnce(of({ data: [] }));
      component.getCommentsExcel({ evaluation_id: '100' });
      expect(mockAlertService.success).toHaveBeenCalledWith('No hay comentarios para exportar.');
    });

    it('should handle error', () => {
      mockCommentService.getCommentsExcel.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.getCommentsExcel({ evaluation_id: '100' });
      expect(mockAlertService.error).toHaveBeenCalled();
    });

    it('should handle null data response', () => {
      mockCommentService.getCommentsExcel.mockReturnValueOnce(of({ data: null }));
      component.getCommentsExcel({ evaluation_id: '100' });
      expect(mockAlertService.success).toHaveBeenCalledWith('No hay comentarios para exportar.');
    });
  });

  describe('showDialog', () => {
    it('should set currentData and visible', () => {
      const data = { changedOldValue: '<p>Old</p>', changedDataInitial: '<p>Init</p>', value: '<p>Current</p>' };
      component.showDialog(data);
      expect(component.currentData).toBe(data);
      expect(component.visible).toBe(true);
    });

    it('should handle missing fields', () => {
      component.showDialog({});
      expect(component.visible).toBe(true);
      expect(component.sanitizedOldValue).toBeTruthy();
    });
  });

  describe('copyToClipboard', () => {
    it('should change icon and reset after timeout', () => {
      jest.useFakeTimers();
      component.copyToClipboard();
      expect(component.aiMatchIcon).toBe('check_circle');
      jest.advanceTimersByTime(300);
      expect(component.aiMatchIcon).toBe('content_copy');
      jest.useRealTimers();
    });
  });

  describe('toggleAssessorsChat', () => {
    it('should toggle isOpen', () => {
      component.assessorsChat.isOpen = false;
      component.toggleAssessorsChat();
      expect(component.assessorsChat.isOpen).toBe(true);
      component.toggleAssessorsChat();
      expect(component.assessorsChat.isOpen).toBe(false);
    });
  });

  describe('addCheckboxes', () => {
    it('should create form controls for detailed data', () => {
      component.detailedData = [
        { approved_no_comment: true, display_name: 'T1', replies_count: '0', enable_comments: true },
        { approved_no_comment: false, display_name: 'T2', replies_count: '1', enable_comments: true },
      ] as any;
      component.addCheckboxes();
      expect(component.formTickData.length).toBe(2);
      expect(component.formTickData.controls[0].value.isChecked).toBe(true);
      expect(component.formTickData.controls[1].value.isChecked).toBe(false);
    });
  });

  describe('checkAllIsApproved', () => {
    it('should return true when all items are approved or have replies', () => {
      component.detailedData = [
        { approved_no_comment: true, display_name: 'T1', replies_count: '0', enable_comments: true },
        { approved_no_comment: false, display_name: 'T2', replies_count: '1', enable_comments: true },
      ] as any;
      component.addCheckboxes();
      const result = component.checkAllIsApproved();
      expect(result).toBe(true);
    });

    it('should return false when some items are not assessed', () => {
      component.detailedData = [
        { approved_no_comment: false, display_name: 'T1', replies_count: '0', enable_comments: true },
        { approved_no_comment: false, display_name: 'T2', replies_count: '0', enable_comments: true },
      ] as any;
      component.addCheckboxes();
      const result = component.checkAllIsApproved();
      expect(result).toBe(false);
    });

    it('should treat disabled comments as approved', () => {
      component.detailedData = [
        { approved_no_comment: false, display_name: 'T1', replies_count: '0', enable_comments: false },
      ] as any;
      component.addCheckboxes();
      const result = component.checkAllIsApproved();
      expect(result).toBe(true);
    });
  });

  describe('validateComments', () => {
    it('should return false when all items have replies or ticks', () => {
      component.detailedData = [
        { replies_count: '1', display_name: 'T1', approved_no_comment: false, enable_comments: true },
      ] as any;
      component.addCheckboxes();
      const result = component.validateComments();
      expect(result).toBe(false);
    });

    it('should return true when an item has no replies and no tick', () => {
      component.detailedData = [
        { replies_count: '0', display_name: 'T1', approved_no_comment: false, enable_comments: true },
      ] as any;
      component.addCheckboxes();
      const result = component.validateComments();
      expect(result).toBe(true);
    });
  });

  describe('validateUpdateEvaluation', () => {
    beforeEach(() => {
      component.currentUser = createMockUser({ cycle: { id: 1 } }) as any;
      mockEvalService.updateDataEvaluation.mockClear();
    });

    it('should set Complete when all fields are checked or commented', () => {
      // Status must NOT be Pending or Finalized to enter the outer if block
      component.gnralInfo.status = DetailedStatus.Autochecked as any;
      component.detailedData = [
        { field_id: 'f1', replies_count: '1', display_name: 'T1', approved_no_comment: false, enable_comments: true, evaluation_id: '100', status: 'autochecked' },
      ] as any;
      component.addCheckboxes();
      component.validateUpdateEvaluation();
      expect(mockEvalService.updateDataEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({ status: DetailedStatus.Complete }),
        '100'
      );
    });

    it('should set Pending when Complete but not all fields assessed', () => {
      component.gnralInfo.status = DetailedStatus.Complete as any;
      component.detailedData = [
        { field_id: 'f1', replies_count: '0', display_name: 'T1', approved_no_comment: false, enable_comments: true, evaluation_id: '100', status: 'complete' },
        { field_id: 'f2', replies_count: '0', display_name: 'T2', approved_no_comment: false, enable_comments: true, evaluation_id: '100', status: 'complete' },
      ] as any;
      component.addCheckboxes();
      component.validateUpdateEvaluation();
      expect(mockEvalService.updateDataEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({ status: DetailedStatus.Pending }),
        '100'
      );
    });

    it('should not update when status is Finalized', () => {
      component.gnralInfo.status = DetailedStatus.Finalized as any;
      component.detailedData = [
        { field_id: 'f1', replies_count: '1', display_name: 'T1', approved_no_comment: false, enable_comments: true, evaluation_id: '100', status: 'finalized' },
      ] as any;
      component.addCheckboxes();
      component.validateUpdateEvaluation();
      expect(mockEvalService.updateDataEvaluation).not.toHaveBeenCalled();
    });

    it('should not update when status is Pending', () => {
      component.gnralInfo.status = DetailedStatus.Pending as any;
      component.detailedData = [
        { field_id: 'f1', replies_count: '1', display_name: 'T1', approved_no_comment: false, enable_comments: true, evaluation_id: '100', status: 'pending' },
      ] as any;
      component.addCheckboxes();
      component.validateUpdateEvaluation();
      expect(mockEvalService.updateDataEvaluation).not.toHaveBeenCalled();
    });
  });

  describe('validateAllFieldsAssessed', () => {
    it('should call updateEvaluation with Finalized when all fields assessed', () => {
      component.gnralInfo.status = DetailedStatus.Pending as any;
      component.detailedData = [
        { field_id: 'f1', replies_count: '1', display_name: 'T1', approved_no_comment: false, enable_comments: true, evaluation_id: '100', status: 'pending' },
      ] as any;
      component.addCheckboxes();
      mockEvalService.updateDataEvaluation.mockClear();
      component.validateAllFieldsAssessed();
      expect(mockEvalService.updateDataEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({ status: DetailedStatus.Finalized }),
        '100'
      );
    });

    it('should call updateEvaluation with Pending when not all fields assessed and status was not Pending', () => {
      component.gnralInfo.status = DetailedStatus.Complete as any;
      component.detailedData = [
        { field_id: 'f1', replies_count: '0', display_name: 'T1', approved_no_comment: false, enable_comments: true, evaluation_id: '100', status: 'complete' },
      ] as any;
      component.addCheckboxes();
      mockEvalService.updateDataEvaluation.mockClear();
      component.validateAllFieldsAssessed();
      expect(mockEvalService.updateDataEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({ status: DetailedStatus.Pending }),
        '100'
      );
    });

    it('should not call updateEvaluation when not all fields assessed and already Pending', () => {
      component.gnralInfo.status = DetailedStatus.Pending as any;
      component.detailedData = [
        { field_id: 'f1', replies_count: '0', display_name: 'T1', approved_no_comment: false, enable_comments: true, evaluation_id: '100', status: 'pending' },
      ] as any;
      component.addCheckboxes();
      mockEvalService.updateDataEvaluation.mockClear();
      component.validateAllFieldsAssessed();
      expect(mockEvalService.updateDataEvaluation).not.toHaveBeenCalled();
    });
  });

  describe('onTickChange', () => {
    it('should call toggleApprovedNoComments when field exists', () => {
      const field = { field_id: 'f1', loading: false, evaluation_id: '100' };
      const event = { target: { checked: true } };
      component.onTickChange(event, field);
      expect(mockCommentService.toggleApprovedNoComments).toHaveBeenCalledWith(
        expect.objectContaining({ meta_array: ['f1'], noComment: true }),
        '100'
      );
    });

    it('should not call service when field is null', () => {
      component.onTickChange({}, null);
      expect(mockCommentService.toggleApprovedNoComments).not.toHaveBeenCalled();
    });

    it('should handle error', () => {
      mockCommentService.toggleApprovedNoComments.mockReturnValueOnce(throwError(() => new Error('fail')));
      const field = { field_id: 'f1', loading: false, evaluation_id: '100' };
      component.onTickChange({ target: { checked: true } }, field);
      expect(mockAlertService.error).toHaveBeenCalled();
      expect(field.loading).toBe(false);
    });
  });

  describe('onChangeSelectAll', () => {
    beforeEach(() => {
      component.gnralInfo.evaluation_id = '100';
      component.detailedData = [
        { field_id: 'f1', replies_count: '0', display_name: 'T1', approved_no_comment: false, enable_comments: true, evaluation_id: '100', status: 'pending' },
      ] as any;
      component.addCheckboxes();
    });

    it('should select all when e is truthy', () => {
      mockEvalService.updateDataEvaluation.mockClear();
      component.onChangeSelectAll(true);
      expect(mockCommentService.toggleApprovedNoComments).toHaveBeenCalledWith(
        expect.objectContaining({ isAll: true, noComment: true }),
        '100'
      );
      // updateEvaluation is called in the subscribe, which calls updateDataEvaluation
      expect(mockEvalService.updateDataEvaluation).toHaveBeenCalled();
    });

    it('should deselect all when e is falsy', () => {
      mockEvalService.updateDataEvaluation.mockClear();
      component.onChangeSelectAll(false);
      expect(mockCommentService.toggleApprovedNoComments).toHaveBeenCalledWith(
        expect.objectContaining({ isAll: true, noComment: false }),
        '100'
      );
    });

    it('should handle error', () => {
      mockCommentService.toggleApprovedNoComments.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.onChangeSelectAll(true);
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('goToLink', () => {
    it('should open URL in new tab', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      component.goToLink('https://example.com');
      expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
      openSpy.mockRestore();
    });
  });

  describe('getLink', () => {
    it('should return true for evidence_link', () => {
      expect(component.getLink({ col_name: 'evidence_link' })).toBe(true);
    });

    it('should return false for other col_name', () => {
      expect(component.getLink({ col_name: 'title' })).toBe(false);
    });
  });

  describe('getDetailedData', () => {
    it('should handle error', () => {
      mockEvalService.getDataEvaluation.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.getDetailedData();
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('getIndicatorCriteria', () => {
    it('should load criteria data', () => {
      component.getIndicatorCriteria('qa_knowledge_product');
      expect(component.criteriaData).toEqual({ id: 1 });
      expect(component.criteria_loading).toBe(false);
    });

    it('should handle error', () => {
      mockEvalService.getCriteriaByIndicator.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.getIndicatorCriteria('qa_knowledge_product');
      expect(component.criteria_loading).toBe(false);
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('markForSecondAssessment', () => {
    it('should toggle requires_second_assessment', () => {
      component.gnralInfo.evaluation_id = '100';
      component.gnralInfo.requires_second_assessment = false;
      component.markForSecondAssessment();
      expect(mockEvalService.updateRequireSecondAssessmentEvaluation).toHaveBeenCalledWith('100', { require_second_assessment: true });
    });

    it('should handle error', () => {
      mockEvalService.updateRequireSecondAssessmentEvaluation.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.gnralInfo.evaluation_id = '100';
      component.gnralInfo.requires_second_assessment = false;
      component.markForSecondAssessment();
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('updateNumCommnts', () => {
    it('should update replies_count and call validateAllFieldsAssessed when validateFields is true', () => {
      component.detailedData = [
        { field_id: 'f1', replies_count: '0', display_name: 'T1', approved_no_comment: false, enable_comments: true, evaluation_id: '100', status: 'pending' },
      ] as any;
      component.addCheckboxes();
      component.gnralInfo.status = DetailedStatus.Pending as any;
      const detailedDataItem = { replies_count: '0' };
      component.updateNumCommnts({ length: 3, validateFields: true }, detailedDataItem);
      expect(detailedDataItem.replies_count).toBe(3);
    });

    it('should not call validateAllFieldsAssessed when validateFields is false', () => {
      const detailedDataItem = { replies_count: '0' };
      component.updateNumCommnts({ length: 1, validateFields: false }, detailedDataItem);
      expect(detailedDataItem.replies_count).toBe(1);
    });
  });

  describe('hideComments', () => {
    it('should toggle activeCommentArr at index', () => {
      component.activeCommentArr = [false, false];
      const field = { clicked: false };
      component.hideComments(0, field);
      expect(component.activeCommentArr[0]).toBe(true);
      expect(field.clicked).toBe(true);
    });
  });
});
