import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Title } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import DetailIndicatorComponent from './detail-indicator.component';
import { EvaluationsService } from '../../../../services/evaluations.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { AlertService } from '../../../../services/alert.service';
import { CommentService } from '../../../../services/comment.service';
import { ExportTablesService } from '../../../../services/export-tables.service';
import { createMockUser, createMockCRPUser } from '../../../../test-helpers/mock-data';
import { Role } from '../../../../_models/roles.model';

describe('DetailIndicatorComponent', () => {
  let component: DetailIndicatorComponent;
  let fixture: ComponentFixture<DetailIndicatorComponent>;
  let mockEvalService: any;
  let mockAuthService: any;
  let mockAlertService: any;
  let mockCommentService: any;
  let mockSpinner: any;
  let mockExportService: any;
  let mockRouter: any;

  const mockUser = createMockCRPUser({
    id: 1,
    username: 'crpuser',
    crp: { crp_id: 5, acronym: 'CRP5' },
  });

  const mockDetailedData = [
    {
      evaluation_id: '200',
      field_id: 'f1',
      col_name: 'title',
      value: 'Test Title',
      status: 'pending',
      response_status: 'pending',
      general_comment: 'CRP comment',
      general_comment_id: '20',
      general_comment_user: 'admin',
      general_comment_updatedAt: '2024-01-01',
      require_second_assessment: false,
      result_code: 'RC100',
      version: '1',
      crp_acronym: 'CRP5',
      enable_crp: 1,
      enable_comments: true,
      replies_count: '0',
    },
  ];

  beforeEach(waitForAsync(() => {
    mockEvalService = {
      getDataEvaluation: jest.fn().mockReturnValue(of({ data: mockDetailedData })),
      updateDataEvaluation: jest.fn().mockReturnValue(of({ message: 'Updated' })),
      getCriteriaByIndicator: jest.fn().mockReturnValue(of({ data: [{ id: 1 }] })),
      getEvaluationStatus: jest.fn().mockReturnValue(of({ data: [{ status: 'pending' }] })),
    };
    mockAuthService = {
      currentUser: of(mockUser),
      currentUserValue: mockUser,
      NOT_APPLICABLE: '<Not applicable>',
    };
    mockAlertService = { error: jest.fn(), success: jest.fn() };
    mockCommentService = {
      getCommentsExcel: jest.fn().mockReturnValue(of({ data: [{ col: 'val' }] })),
      createDataCommentReply: jest.fn().mockReturnValue(of({ message: 'Replied' })),
      updateCommentReply: jest.fn().mockReturnValue(of({ message: 'Updated' })),
      getDataCommentReply: jest.fn().mockReturnValue(of({ data: [] })),
    };
    mockSpinner = { show: jest.fn(), hide: jest.fn() };
    mockExportService = { exportExcel: jest.fn() };
    mockRouter = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      imports: [DetailIndicatorComponent, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ type: 'knowledge_product', indicatorId: '456' }),
            snapshot: { params: { type: 'knowledge_product', indicatorId: '456' }, queryParamMap: { get: jest.fn().mockReturnValue(null) } },
          },
        },
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
      .overrideComponent(DetailIndicatorComponent, { set: { imports: [], template: '', animations: [] } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailIndicatorComponent);
    component = fixture.componentInstance;
    component.currentUser = mockUser as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('validateCommentAvility', () => {
    it('should return true for admin role', () => {
      component.currentUser = createMockUser({ roles: [{ description: Role.admin }] }) as any;
      const field = { enable_crp: 0, enable_comments: false };
      expect(component.validateCommentAvility(field, false)).toBe(true);
    });

    it('should return true for CRP when enable_crp=1 and enable_comments=true', () => {
      component.currentUser = createMockCRPUser() as any;
      const field = { enable_crp: 1, enable_comments: true };
      expect(component.validateCommentAvility(field, false)).toBe(true);
    });

    it('should return false for CRP when enable_crp=1 and enable_comments=false', () => {
      component.currentUser = createMockCRPUser() as any;
      const field = { enable_crp: 1, enable_comments: false };
      expect(component.validateCommentAvility(field, false)).toBe(false);
    });

    it('should return falsy for CRP when enable_crp=0', () => {
      component.currentUser = createMockCRPUser() as any;
      const field = { enable_crp: 0, enable_comments: true };
      expect(component.validateCommentAvility(field, false)).toBeFalsy();
    });

    it('should return false for unknown role (default)', () => {
      component.currentUser = createMockUser({ roles: [{ description: 'GUEST' }] }) as any;
      const field = { enable_crp: 1, enable_comments: true };
      expect(component.validateCommentAvility(field, false)).toBe(false);
    });
  });

  describe('getCommentsExcel', () => {
    beforeEach(() => {
      component.detailedData = mockDetailedData as any;
      component.params = { type: 'knowledge_product', indicatorId: '456' };
    });

    it('should export excel with data', () => {
      component.getCommentsExcel({ evaluation_id: '200' });
      expect(mockCommentService.getCommentsExcel).toHaveBeenCalled();
      expect(mockExportService.exportExcel).toHaveBeenCalled();
    });

    it('should show success message when no data', () => {
      mockCommentService.getCommentsExcel.mockReturnValueOnce(of({ data: [] }));
      component.getCommentsExcel({ evaluation_id: '200' });
      expect(mockAlertService.success).toHaveBeenCalledWith('No hay comentarios para exportar.');
    });

    it('should handle null data', () => {
      mockCommentService.getCommentsExcel.mockReturnValueOnce(of({ data: null }));
      component.getCommentsExcel({ evaluation_id: '200' });
      expect(mockAlertService.success).toHaveBeenCalledWith('No hay comentarios para exportar.');
    });

    it('should handle error', () => {
      mockCommentService.getCommentsExcel.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.getCommentsExcel({ evaluation_id: '200' });
      expect(mockAlertService.error).toHaveBeenCalled();
    });

    it('should use crp_id from user when crp_acronym not available', () => {
      component.detailedData = [{ ...mockDetailedData[0], crp_acronym: null }] as any;
      component.getCommentsExcel({ evaluation_id: '200' });
      expect(mockCommentService.getCommentsExcel).toHaveBeenCalledWith(
        expect.objectContaining({ crp_id: 5 })
      );
    });
  });

  describe('addGeneralComment', () => {
    beforeEach(() => {
      component.generalCommentGroup = component['formBuilder'].group({
        general_comment: ['test reply'],
      });
    });

    it('should show error when form is invalid', () => {
      component.generalCommentGroup.controls['general_comment'].setValue('');
      component.generalCommentGroup.controls['general_comment'].setErrors({ required: true });
      component.addGeneralComment({ general_comment_id: '20' });
      expect(mockAlertService.error).toHaveBeenCalledWith('Reply to general comment can not be empty', false);
    });

    it('should create reply successfully', () => {
      component.addGeneralComment({ general_comment_id: '20' });
      expect(mockCommentService.createDataCommentReply).toHaveBeenCalledWith(
        expect.objectContaining({ commentId: 20, userId: 1 })
      );
    });

    it('should handle error', () => {
      mockCommentService.createDataCommentReply.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.addGeneralComment({ general_comment_id: '20' });
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('updateGeneralCommentReply', () => {
    it('should update reply and toggle type', () => {
      const data = { is_visible: false };
      component.updateGeneralCommentReply('is_visible', data);
      expect(data.is_visible).toBe(true);
      expect(mockCommentService.updateCommentReply).toHaveBeenCalled();
    });

    it('should handle error', () => {
      mockCommentService.updateCommentReply.mockReturnValueOnce(throwError(() => new Error('fail')));
      const data = { is_visible: false };
      component.updateGeneralCommentReply('is_visible', data);
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('getCurrentTypeUrl', () => {
    it('should return ipsr URL for innovation_use_ipsr', () => {
      component.params = { type: 'innovation_use_ipsr' };
      component.prUrl = 'https://pr.example.com/';
      component.detailedData = [{ result_code: 'RC100', version: '1' }];
      const url = component.getCurrentTypeUrl();
      expect(url).toContain('ipsr/');
      expect(url).toContain('detail/');
    });

    it('should return regular URL for non-ipsr', () => {
      component.params = { type: 'knowledge_product' };
      component.prUrl = 'https://pr.example.com/';
      component.detailedData = [{ result_code: 'RC100', version: '2' }];
      const url = component.getCurrentTypeUrl();
      expect(url).toContain('result/');
      expect(url).toContain('result-detail/');
      expect(url).toContain('phase=2');
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
    it('should load criteria', () => {
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

  describe('updateEvaluation', () => {
    it('should update status type', () => {
      component.gnralInfo.status = 'complete' as any;
      const data = [{ evaluation_id: '200', status: 'pending' }];
      component.updateEvaluation('status', data);
      expect(mockEvalService.updateDataEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'complete' }),
        '200'
      );
    });

    it('should handle default case', () => {
      const data = [{ evaluation_id: '200', status: 'pending' }];
      component.updateEvaluation('unknown', data);
      expect(mockEvalService.updateDataEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending' }),
        '200'
      );
    });

    it('should handle error', () => {
      mockEvalService.updateDataEvaluation.mockReturnValueOnce(throwError(() => new Error('fail')));
      const data = [{ evaluation_id: '200', status: 'pending' }];
      component.updateEvaluation('status', data);
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('updateNumCommnts', () => {
    it('should update replies_count and comments_replies_count', () => {
      const detailedDataItem = { replies_count: '0', comments_replies_count: 0 };
      component.updateNumCommnts({ length: 5, replies_count: 3, validateFields: false }, detailedDataItem);
      expect(detailedDataItem.replies_count).toBe(5);
      expect(detailedDataItem.comments_replies_count).toBe(3);
    });
  });

  describe('hideComments', () => {
    it('should toggle activeCommentArr', () => {
      component.activeCommentArr = [false, false];
      const field = { clicked: false };
      component.hideComments(0, field);
      expect(component.activeCommentArr[0]).toBe(true);
      expect(field.clicked).toBe(true);
    });
  });

  describe('getCommentReplies', () => {
    it('should handle error that is not OK', () => {
      mockCommentService.getDataCommentReply.mockReturnValueOnce(throwError(() => 'some error'));
      component.gnralInfo.general_comment_id = '20';
      component.gnralInfo.evaluation_id = '200';
      component.getCommentReplies();
      expect(mockAlertService.error).toHaveBeenCalled();
    });

    it('should not alert when error is OK', () => {
      mockCommentService.getDataCommentReply.mockReturnValueOnce(throwError(() => 'OK'));
      mockAlertService.error.mockClear();
      component.gnralInfo.general_comment_id = '20';
      component.gnralInfo.evaluation_id = '200';
      component.getCommentReplies();
      expect(mockAlertService.error).not.toHaveBeenCalled();
    });
  });

  describe('getEvaluationStatus', () => {
    it('should set response_status and eval_stat', () => {
      component.params = { indicatorId: '456' };
      component.getEvaluationStatus();
      expect(component.gnralInfo.response_status).toBe('pending');
      expect(component.eval_stat).toBe('pending');
    });
  });
});
