import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

import { CommentComponent } from './comment.component';
import { AuthenticationService } from '../services/authentication.service';
import { AlertService } from '../services/alert.service';
import { CommentService } from '../services/comment.service';
import { createMockUser, createMockCRPUser } from '../test-helpers/mock-data';
import { ReplyTypes } from '../_models/general-status.model';
import { Role } from '../_models/roles.model';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;
  let mockAuthService: any;
  let mockAlertService: any;
  let mockCommentService: any;
  let mockSpinner: any;

  const mockUser = createMockUser({
    id: 1,
    username: 'testuser',
    indicators: [{ isTPB: false }],
    config: [{ roleId: 1 }],
  });

  beforeEach(waitForAsync(() => {
    mockAuthService = {
      currentUser: of(mockUser),
      currentUserValue: mockUser,
    };
    mockAlertService = { error: jest.fn(), success: jest.fn() };
    mockCommentService = {
      getDataComment: jest.fn().mockReturnValue(of({
        data: [
          { id: 1, approved: true, is_deleted: false, replies: { replies_count: '0' }, replyType: { id: 1 } },
        ],
      })),
      createDataComment: jest.fn().mockReturnValue(of({ data: { id: 99 }, message: 'Created' })),
      updateDataComment: jest.fn().mockReturnValue(of({ message: 'Updated' })),
      createDataCommentReply: jest.fn().mockReturnValue(of({ message: 'Replied' })),
      updateCommentReply: jest.fn().mockReturnValue(of({ message: 'Updated' })),
      patchHighlightComment: jest.fn().mockReturnValue(of({ message: 'ok' })),
      patchRequireChanges: jest.fn().mockReturnValue(of({ message: 'ok' })),
      patchPpuChanges: jest.fn().mockReturnValue(of({ message: 'ok' })),
      getQuickComments: jest.fn().mockReturnValue(of({ data: ['Quick comment 1'] })),
      createTag: jest.fn().mockReturnValue(of({ message: 'Tag created' })),
      getTagId: jest.fn().mockReturnValue(of({ data: [{ tagId: 1 }] })),
      deleteTag: jest.fn().mockReturnValue(of({ message: 'Tag deleted' })),
      getDataCommentReply: jest.fn().mockReturnValue(of({ data: [] })),
    };
    mockSpinner = { show: jest.fn(), hide: jest.fn() };

    TestBed.configureTestingModule({
      imports: [CommentComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: CommentService, useValue: mockCommentService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(CommentComponent, { set: { imports: [], template: '' } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.currentUser = mockUser as any;
    component.detailedData = [];
    component.isCRP = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('findAdminUser', () => {
    it('should set adminUser to true when roleId=1 found', () => {
      component.currentUser = createMockUser({ config: [{ roleId: 1 }] }) as any;
      component.findAdminUser();
      expect(component.adminUser).toBe(true);
    });

    it('should set adminUser to false when roleId=1 not found', () => {
      component.currentUser = createMockUser({ config: [{ roleId: 2 }] }) as any;
      component.findAdminUser();
      expect(component.adminUser).toBe(false);
    });
  });

  describe('istpbUser', () => {
    it('should set tpbUser when isTPB found', () => {
      component.currentUser = createMockUser({ indicators: [{ isTPB: true }] }) as any;
      component.istpbUser();
      expect(component.tpbUser).toBeTruthy();
    });

    it('should set tpbUser to undefined when not found', () => {
      component.currentUser = createMockUser({ indicators: [{ isTPB: false }] }) as any;
      component.istpbUser();
      expect(component.tpbUser).toBeUndefined();
    });
  });

  describe('getItemCommentData', () => {
    beforeEach(() => {
      component.dataFromItem = { evaluation_id: '100', field_id: 'f1' };
    });

    it('should return early when evaluation_id is null', () => {
      component.dataFromItem = { evaluation_id: null, field_id: 'f1' };
      component.getItemCommentData();
      expect(mockCommentService.getDataComment).not.toHaveBeenCalled();
    });

    it('should return early when field_id is null', () => {
      component.dataFromItem = { evaluation_id: '100', field_id: null };
      component.getItemCommentData();
      expect(mockCommentService.getDataComment).not.toHaveBeenCalled();
    });

    it('should load comments for default role', () => {
      component.getItemCommentData();
      expect(mockCommentService.getDataComment).toHaveBeenCalledWith({ evaluationId: '100', metaId: 'f1' });
      expect(component.commentsByCol).toBeDefined();
    });

    it('should filter approved comments for CRP role', () => {
      component.currentUser = createMockCRPUser() as any;
      mockCommentService.getDataComment.mockReturnValueOnce(of({
        data: [
          { id: 1, approved: true, is_deleted: false, replies: { replies_count: '0' } },
          { id: 2, approved: false, is_deleted: false, replies: { replies_count: '0' } },
        ],
      }));
      component.getItemCommentData();
      expect(component.commentsByCol).toHaveLength(1);
      expect(component.crpComment).toBe(true);
    });

    it('should handle comment with replies', () => {
      mockCommentService.getDataComment.mockReturnValueOnce(of({
        data: [
          { id: 1, approved: true, is_deleted: false, replies: { replies_count: '2' } },
        ],
      }));
      component.getItemCommentData();
      expect(mockCommentService.getDataCommentReply).toHaveBeenCalled();
    });

    it('should handle error', () => {
      mockCommentService.getDataComment.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.getItemCommentData();
      expect(mockAlertService.error).toHaveBeenCalled();
    });

    it('should emit updateNumCommnts with correct counts', () => {
      const emitSpy = jest.spyOn(component.updateNumCommnts, 'emit');
      component.getItemCommentData(true);
      expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ validateFields: true }));
    });

    it('should set commentsByColSelected to first non-deleted comment', () => {
      mockCommentService.getDataComment.mockReturnValueOnce(of({
        data: [
          { id: 1, approved: true, is_deleted: true, replies: { replies_count: '0' } },
          { id: 2, approved: true, is_deleted: false, replies: { replies_count: '0' } },
        ],
      }));
      component.getItemCommentData();
      expect(component.commentsByColSelected.id).toBe(2);
    });
  });

  describe('addComment', () => {
    beforeEach(() => {
      component.dataFromItem = { evaluation_id: '100', field_id: 'f1' };
      component.commentGroup = component['formBuilder'].group({
        comment: ['test comment'],
      });
    });

    it('should show error when form is invalid', () => {
      component.commentGroup.controls['comment'].setValue('');
      component.commentGroup.controls['comment'].setErrors({ required: true });
      component.addComment();
      expect(mockAlertService.error).toHaveBeenCalledWith('comment is required', false);
    });

    it('should create comment successfully', () => {
      component.addComment();
      expect(mockCommentService.createDataComment).toHaveBeenCalledWith(
        expect.objectContaining({
          evaluationId: '100',
          metaId: 'f1',
        })
      );
    });

    it('should handle error on create', () => {
      mockCommentService.createDataComment.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.addComment();
      expect(mockAlertService.error).toHaveBeenCalled();
    });

    it('should detect TPB user', () => {
      component.currentUser = createMockUser({ indicators: [{ isTPB: true }] }) as any;
      component.addComment();
      expect(component.tpbUser).toBeTruthy();
    });
  });

  describe('isCommentAvailable', () => {
    beforeEach(() => {
      component.availableComment = false;
      component.crpComment = false;
      component.commentsByColSelected = { tpb: 0 };
      component.isCRP = false;
    });

    it('should return true when cycle.id is 2 and is_core is true', () => {
      component.currentUser = createMockUser({ cycle: { id: 2 } }) as any;
      component.dataFromItem = { is_core: true };
      expect(component.isCommentAvailable()).toBe(true);
    });

    it('should return false when cycle.id is 2 and is_core is false', () => {
      component.currentUser = createMockUser({ cycle: { id: 2 } }) as any;
      component.dataFromItem = { is_core: false };
      expect(component.isCommentAvailable()).toBe(false);
    });

    it('should return true when cycle.id is not 2', () => {
      component.currentUser = createMockUser({ cycle: { id: 1 } }) as any;
      component.dataFromItem = {};
      expect(component.isCommentAvailable()).toBe(true);
    });

    it('should return false when availableComment is true', () => {
      component.availableComment = true;
      component.currentUser = createMockUser({ cycle: { id: 1 } }) as any;
      component.dataFromItem = {};
      expect(component.isCommentAvailable()).toBe(false);
    });

    it('should return false when isCRP is true', () => {
      component.isCRP = true;
      component.currentUser = createMockUser({ cycle: { id: 1 } }) as any;
      component.dataFromItem = {};
      expect(component.isCommentAvailable()).toBe(false);
    });

    it('should return false when tpb is 1 on selected comment', () => {
      component.commentsByColSelected = { tpb: 1 };
      component.currentUser = createMockUser({ cycle: { id: 1 } }) as any;
      component.dataFromItem = {};
      expect(component.isCommentAvailable()).toBe(false);
    });
  });

  describe('validComment', () => {
    it('should allow when type is approved and data.approved is true', () => {
      component.commentsByCol = [{ approved: true }];
      const result = component.validComment('approved', { approved: true });
      expect(result.is_valid).toBe(true);
    });

    it('should block when type is approved and existing approved but data not approved', () => {
      component.commentsByCol = [{ approved: true }];
      const result = component.validComment('approved', { approved: false });
      expect(result.is_valid).toBe(false);
      expect(result.message).toContain('APPROVED');
    });

    it('should return valid for default type', () => {
      const result = component.validComment('is_visible', {});
      expect(result.is_valid).toBe(true);
    });
  });

  describe('updateComment', () => {
    it('should not update when validComment fails', () => {
      component.commentsByCol = [{ approved: true }];
      const data = { approved: false, is_visible: true, is_deleted: false, id: 1, detail: 'test', obj_user: { id: 1 } };
      component.updateComment('approved', data, 1);
      expect(mockAlertService.error).toHaveBeenCalledWith(expect.stringContaining('APPROVED'));
      expect(mockCommentService.updateDataComment).not.toHaveBeenCalled();
    });

    it('should update when valid', () => {
      component.commentsByCol = [];
      component.dataFromItem = { evaluation_id: '100', field_id: 'f1' };
      const data = { approved: false, is_visible: true, is_deleted: false, id: 1, detail: 'test', obj_user: { id: 1 } };
      component.updateComment('approved', data, 1);
      expect(mockCommentService.updateDataComment).toHaveBeenCalled();
    });

    it('should handle error', () => {
      component.commentsByCol = [];
      component.dataFromItem = { evaluation_id: '100', field_id: 'f1' };
      mockCommentService.updateDataComment.mockReturnValueOnce(throwError(() => new Error('fail')));
      const data = { approved: false, is_visible: true, is_deleted: false, id: 1, detail: 'test', obj_user: { id: 1 } };
      component.updateComment('approved', data, 1);
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('updateCommentReply', () => {
    it('should not update when validComment fails', () => {
      component.commentsByCol = [{ approved: true }];
      const data = { approved: false, user: { replies: [], crps: [], indicators: [] } };
      component.updateCommentReply('approved', data);
      expect(mockAlertService.error).toHaveBeenCalled();
    });

    it('should update reply and clean user data', () => {
      component.commentsByCol = [];
      component.dataFromItem = { evaluation_id: '100', field_id: 'f1' };
      const data = { is_visible: false, user: { replies: [1], crps: [2], indicators: [3] } };
      component.updateCommentReply('is_visible', data);
      expect(data.user).not.toHaveProperty('replies');
      expect(data.user).not.toHaveProperty('crps');
      expect(mockCommentService.updateCommentReply).toHaveBeenCalled();
    });

    it('should handle error', () => {
      component.commentsByCol = [];
      component.dataFromItem = { evaluation_id: '100', field_id: 'f1' };
      mockCommentService.updateCommentReply.mockReturnValueOnce(throwError(() => new Error('fail')));
      const data = { is_visible: false, user: { replies: [], crps: [], indicators: [] } };
      component.updateCommentReply('is_visible', data);
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('replyComment', () => {
    beforeEach(() => {
      component.dataFromItem = { evaluation_id: '100', field_id: 'f1' };
      component.commentGroup = component['formBuilder'].group({
        comment: ['reply text'],
      });
    });

    it('should show error when form is invalid and replyType is not accepted', () => {
      component.commentGroup.controls['comment'].setValue('');
      component.commentGroup.controls['comment'].setErrors({ required: true });
      const comment = { id: 1, replyTypeId: ReplyTypes.disagree };
      component.replyComment(comment);
      expect(mockAlertService.error).toHaveBeenCalledWith('Comment is required', false);
    });

    it('should allow empty comment for accepted replyType', () => {
      component.commentGroup.controls['comment'].setValue('');
      component.commentGroup.controls['comment'].setErrors({ required: true });
      const comment = { id: 1, replyTypeId: ReplyTypes.accepted };
      component.replyComment(comment);
      expect(mockCommentService.createDataCommentReply).toHaveBeenCalled();
    });

    it('should allow empty comment for accepted_with_comment replyType', () => {
      component.commentGroup.controls['comment'].setValue('');
      component.commentGroup.controls['comment'].setErrors({ required: true });
      const comment = { id: 1, replyTypeId: ReplyTypes.accepted_with_comment };
      component.replyComment(comment);
      expect(mockCommentService.createDataCommentReply).toHaveBeenCalled();
    });

    it('should create reply successfully', () => {
      const emitSpy = jest.spyOn(component.evalu_stat, 'emit');
      const comment = { id: 1, replyTypeId: ReplyTypes.disagree, crp_response: false };
      component.replyComment(comment);
      expect(mockCommentService.createDataCommentReply).toHaveBeenCalledWith(
        expect.objectContaining({ commentId: 1 })
      );
    });

    it('should handle error', () => {
      mockCommentService.createDataCommentReply.mockReturnValueOnce(throwError(() => new Error('fail')));
      const comment = { id: 1, replyTypeId: ReplyTypes.disagree };
      component.replyComment(comment);
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('UpdateHighlightComment', () => {
    it('should update highlight when detailItem found in detailedData', () => {
      component.detailedData = [{ general_comment_id: 5 }];
      component.dataFromItem = { evaluation_id: '100', field_id: 'f1' };
      const comment = { id: 5, highlight_comment: false };
      component.UpdateHighlightComment(1, false, comment);
      expect(mockCommentService.patchHighlightComment).toHaveBeenCalledWith(
        expect.objectContaining({ highlight_comment: true })
      );
    });

    it('should use commentsByColSelected when not found in detailedData', () => {
      component.detailedData = [{ general_comment_id: 999 }];
      component.commentsByColSelected = { highlight_comment: false };
      component.dataFromItem = { evaluation_id: '100', field_id: 'f1' };
      const comment = { id: 10, highlight_comment: true };
      component.UpdateHighlightComment(1, true, comment);
      expect(mockCommentService.patchHighlightComment).toHaveBeenCalledWith(
        expect.objectContaining({ highlight_comment: false })
      );
    });
  });

  describe('UpdateRequireChanges', () => {
    it('should call patchRequireChanges', () => {
      component.dataFromItem = { evaluation_id: '100', field_id: 'f1' };
      component.UpdateRequireChanges(1, true);
      expect(mockCommentService.patchRequireChanges).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, require_changes: true, tpb: true })
      );
    });
  });

  describe('toggleTag', () => {
    beforeEach(() => {
      component.dataFromItem = { evaluation_id: '100', field_id: 'f1' };
    });

    it('should call addTag when newTagValue is true', () => {
      component.toggleTag({ commentId: 1, tagTypeId: 2, newTagValue: true });
      expect(mockCommentService.createTag).toHaveBeenCalledWith(
        expect.objectContaining({ commentId: 1, tagTypeId: 2 })
      );
    });

    it('should call deleteTag when newTagValue is false', () => {
      component.toggleTag({ commentId: 1, tagTypeId: 2, newTagValue: false });
      expect(mockCommentService.getTagId).toHaveBeenCalled();
    });

    it('should handle addTag error', () => {
      mockCommentService.createTag.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.toggleTag({ commentId: 1, tagTypeId: 2, newTagValue: true });
      expect(mockAlertService.error).toHaveBeenCalled();
    });

    it('should handle deleteTag error', () => {
      mockCommentService.getTagId.mockReturnValueOnce(throwError(() => new Error('fail')));
      component.toggleTag({ commentId: 1, tagTypeId: 2, newTagValue: false });
      expect(mockAlertService.error).toHaveBeenCalled();
    });
  });

  describe('updateData', () => {
    it('should return early when evaluation_id is null', () => {
      component.updateData({ evaluation_id: null }, { field_id: 'f1' });
      expect(mockAlertService.error).toHaveBeenCalledWith(expect.stringContaining('missing evaluation'));
    });

    it('should return early when field_id is empty', () => {
      component.updateData({ evaluation_id: '100' }, { field_id: '' });
      expect(mockAlertService.error).toHaveBeenCalledWith(expect.stringContaining('missing evaluation'));
    });

    it('should call getItemCommentData when data is valid', () => {
      const spy = jest.spyOn(component, 'getItemCommentData');
      component.updateData({ evaluation_id: '100' }, { field_id: 'f1' });
      expect(spy).toHaveBeenCalledWith(false);
    });
  });

  describe('closeComments', () => {
    it('should reset state and emit parentFun', () => {
      const emitSpy = jest.spyOn(component.parentFun, 'emit');
      component.commentsByCol = [{ id: 1 }];
      component.availableComment = true;
      component.closeComments();
      expect(emitSpy).toHaveBeenCalled();
      expect(component.commentsByCol).toEqual([]);
      expect(component.availableComment).toBe(false);
    });
  });

  describe('answerComment', () => {
    it('should set crp_response and replyTypeId on comment', () => {
      const emitSpy = jest.spyOn(component.evalu_stat, 'emit');
      const comment: any = {};
      component.answerComment(true, 1, comment);
      expect(comment.crp_response).toBe(true);
      expect(comment.replyTypeId).toBe(1);
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    beforeEach(() => {
      component.dataFromItem = { evaluation_id: '100', field_id: 'f1' };
      component.commentGroup = component['formBuilder'].group({
        comment: ['reply text'],
      });
    });

    it('should use accepted_with_comment when is_approved and has comment text', () => {
      component.is_approved = true;
      const comment: any = {};
      component.confirm(comment);
      expect(comment.replyTypeId).toBe(ReplyTypes.accepted_with_comment);
      expect(component.showDialog).toBe(false);
    });

    it('should use accepted when is_approved and no comment text', () => {
      component.is_approved = true;
      component.commentGroup.controls['comment'].setValue('');
      const comment: any = {};
      component.confirm(comment);
      expect(comment.replyTypeId).toBe(ReplyTypes.accepted);
    });

    it('should use disagree when not approved', () => {
      component.is_approved = false;
      const comment: any = {};
      component.confirm(comment);
      expect(comment.replyTypeId).toBe(ReplyTypes.disagree);
    });
  });

  describe('setCommentValue', () => {
    it('should set comment form value', () => {
      component.commentGroup = component['formBuilder'].group({
        comment: [''],
      });
      const mockButton = { blur: jest.fn() } as any;
      component.setCommentValue('New comment', mockButton);
      expect(component.commentGroup.controls['comment'].value).toBe('New comment');
      expect(mockButton.blur).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should shift admin role when isCRP and user is admin', () => {
      component.currentUser = createMockUser({
        roles: [{ description: Role.admin }, { description: Role.crp }],
        config: [{ roleId: 2 }],
        indicators: [],
      }) as any;
      component.isCRP = true;
      component.ngOnInit();
      expect(component.currentUser.roles[0].description).toBe(Role.crp);
    });

    it('should fetch quick comments when not CRP', () => {
      component.isCRP = false;
      component.ngOnInit();
      expect(mockCommentService.getQuickComments).toHaveBeenCalled();
    });

    it('should not fetch quick comments when CRP', () => {
      component.isCRP = true;
      mockCommentService.getQuickComments.mockClear();
      component.ngOnInit();
      expect(mockCommentService.getQuickComments).not.toHaveBeenCalled();
    });
  });
});
