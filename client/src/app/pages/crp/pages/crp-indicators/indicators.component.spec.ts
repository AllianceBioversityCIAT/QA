import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Title } from '@angular/platform-browser';

import CRPIndicatorsComponent from './indicators.component';
import { DashboardService } from '../../../../services/dashboard.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { AlertService } from '../../../../services/alert.service';
import { CommentService } from '../../../../services/comment.service';
import { ExportTablesService } from '../../../../services/export-tables.service';
import { createMockCRPUser } from '../../../../test-helpers/mock-data';

describe('CRPIndicatorsComponent', () => {
  let component: CRPIndicatorsComponent;
  let fixture: ComponentFixture<CRPIndicatorsComponent>;
  let mockDashService: any;
  let mockAuthService: any;
  let mockAlertService: any;
  let mockCommentService: any;
  let mockExportService: any;

  const mockUser = createMockCRPUser({ id: 1, crp: { crp_id: 5, acronym: 'CRP5' } });

  beforeEach(waitForAsync(() => {
    mockDashService = {
      geListDashboardEvaluations: jest.fn().mockReturnValue(of({ data: [{ id: 1 }, { id: 2 }] })),
    };
    mockAuthService = {
      currentUser: of(mockUser),
      currentUserValue: mockUser,
      getBrowser: jest.fn().mockReturnValue('Chrome'),
    };
    mockAlertService = { error: jest.fn() };
    mockCommentService = {
      getCommentsExcel: jest.fn().mockReturnValue(of({ data: [{ col: 'val' }] })),
    };
    mockExportService = { exportExcel: jest.fn() };

    TestBed.configureTestingModule({
      imports: [CRPIndicatorsComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ type: 'knowledge_product', primary_column: 'id' }),
            snapshot: { params: { type: 'knowledge_product', primary_column: 'id' } },
          },
        },
        { provide: DashboardService, useValue: mockDashService },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: CommentService, useValue: mockCommentService },
        { provide: ExportTablesService, useValue: mockExportService },
        { provide: Title, useValue: { setTitle: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(CRPIndicatorsComponent, { set: { imports: [], template: '' } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRPIndicatorsComponent);
    component = fixture.componentInstance;
    component.currentUser = mockUser as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getEvaluationsList', () => {
    it('should load evaluations', () => {
      component.getEvaluationsList({ type: 'knowledge_product', primary_column: 'id' });
      expect(component.evaluationList).toHaveLength(2);
      expect(component.returnedArray).toHaveLength(2);
      expect(component.listLoading).toBe(false);
    });

    it('should handle null data', () => {
      mockDashService.geListDashboardEvaluations.mockReturnValueOnce(of({ data: null }));
      component.getEvaluationsList({ type: 'knowledge_product', primary_column: 'id' });
      expect(component.evaluationList).toEqual([]);
    });

    it('should handle error', () => {
      mockDashService.geListDashboardEvaluations.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.getEvaluationsList({ type: 'knowledge_product', primary_column: 'id' });
      expect(mockAlertService.error).toHaveBeenCalled();
      expect(component.evaluationList).toEqual([]);
      expect(component.listLoading).toBe(false);
    });

    it('should pass filter parameter', () => {
      component.getEvaluationsList({ type: 'knowledge_product', primary_column: 'id' }, 'my_submissions');
      expect(mockDashService.geListDashboardEvaluations).toHaveBeenCalledWith(
        1, 'qa_knowledge_product', 'id', 5, 'my_submissions'
      );
    });
  });

  describe('setUserFilter', () => {
    it('should update userFilter and reload', () => {
      component.setUserFilter('my_submissions');
      expect(component.userFilter).toBe('my_submissions');
      expect(mockDashService.geListDashboardEvaluations).toHaveBeenCalled();
    });

    it('should clear filter with null', () => {
      component.setUserFilter(null);
      expect(component.userFilter).toBeNull();
    });
  });

  describe('showNoUserResultsMessage', () => {
    it('should return false when loading', () => {
      component.listLoading = true;
      expect(component.showNoUserResultsMessage).toBe(false);
    });

    it('should return false when evaluationList is null', () => {
      component.listLoading = false;
      component.evaluationList = null;
      expect(component.showNoUserResultsMessage).toBe(false);
    });

    it('should return false when evaluationList has items', () => {
      component.listLoading = false;
      component.evaluationList = [{ id: 1 }] as any;
      expect(component.showNoUserResultsMessage).toBe(false);
    });

    it('should return true when empty and filter is my_created', () => {
      component.listLoading = false;
      component.evaluationList = [];
      component.userFilter = 'my_created';
      expect(component.showNoUserResultsMessage).toBe(true);
    });

    it('should return true when empty and filter is my_submissions', () => {
      component.listLoading = false;
      component.evaluationList = [];
      component.userFilter = 'my_submissions';
      expect(component.showNoUserResultsMessage).toBe(true);
    });

    it('should return false when empty and filter is null', () => {
      component.listLoading = false;
      component.evaluationList = [];
      component.userFilter = null;
      expect(component.showNoUserResultsMessage).toBe(false);
    });
  });

  describe('exportComments', () => {
    beforeEach(() => {
      component.indicatorType = 'knowledge_product';
    });

    it('should export with item', () => {
      component.exportComments({ id: 1, evaluation_id: '100' });
      expect(mockCommentService.getCommentsExcel).toHaveBeenCalledWith(
        expect.objectContaining({ evaluationId: '100' })
      );
      expect(mockExportService.exportExcel).toHaveBeenCalled();
    });

    it('should export all when all flag is true', () => {
      component.exportComments({ id: 1, evaluation_id: '100' }, true);
      expect(mockCommentService.getCommentsExcel).toHaveBeenCalledWith(
        expect.objectContaining({ crp_id: 5 })
      );
    });

    it('should append .xlsx for Safari', () => {
      mockAuthService.getBrowser.mockReturnValue('Safari');
      component.exportComments({ id: 1, evaluation_id: '100' });
      expect(mockExportService.exportExcel).toHaveBeenCalled();
    });

    it('should handle error', () => {
      mockCommentService.getCommentsExcel.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.exportComments({ id: 1, evaluation_id: '100' });
      expect(mockAlertService.error).toHaveBeenCalled();
    });

    it('should handle null item', () => {
      component.exportComments(null);
      expect(mockCommentService.getCommentsExcel).toHaveBeenCalledWith(
        expect.objectContaining({ evaluationId: undefined })
      );
    });
  });

  describe('returnListName', () => {
    it('should return header name for slo', () => {
      expect(component.returnListName('slo', 'header')).toBe('Evidence on Progress towards SRF targets');
    });

    it('should return default header name', () => {
      component.indicatorTypeName = 'Knowledge Product';
      expect(component.returnListName('other', 'header')).toBe('List of Knowledge Product');
    });

    it('should return list name for slo', () => {
      expect(component.returnListName('slo', 'list')).toBe('SLO target');
    });

    it('should return list name for milestones', () => {
      expect(component.returnListName('milestones', 'list')).toBe('Milestone statement');
    });

    it('should return default list name', () => {
      expect(component.returnListName('other', 'list')).toBe('Title');
    });

    it('should return empty for unknown type', () => {
      expect(component.returnListName('slo', 'other' as any)).toBe('');
    });
  });
});
