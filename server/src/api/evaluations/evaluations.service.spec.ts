import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationsService } from './evaluations.service';
import { EvaluationRepository } from './repositories/evaluation.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { CommentsRepository } from '../comments/repositories/comments.repository';
import { TagsRepository } from '../comments/repositories/tags.repository';
import { ReplyTypeRepository } from '../comments/repositories/reply-type.repository';
import { CommentsRepliesRepository } from '../comments/repositories/comments-reply.repository';
import { IndicatorsRepository } from '../indicators/repositories/indicators.repository';
import { AiHelperRepository } from '../ai-helper/ai-helper.repository';
import { StatusHandler } from './enum/status-handler.enum';

describe('EvaluationsService', () => {
  let service: EvaluationsService;

  const mockEvaluationRepository = {
    getUser: jest.fn(),
    getEvaluationsByCrpId: jest.fn(),
    getAllEvaluations: jest.fn(),
    groupBy: jest.fn(),
    getEvaluationsDashByCRP: jest.fn(),
    getAllEvaluationsDash: jest.fn(),
    getEvaluationsDashByUserId: jest.fn(),
    getType: jest.fn(),
    parseEvaluationsData: jest.fn(),
    changedFieldsInitial: jest.fn(),
    changedFieldsPhase: jest.fn(),
    findOneById: jest.fn(),
    getMetaIdByViewName: jest.fn(),
    save: jest.fn(),
    findActiveCRPs: jest.fn(),
    getIndicatorsByCrp: jest.fn(),
    getDetailedEvaluationForAdmin: jest.fn(),
    getDetailedEvaluationForCrp: jest.fn(),
    getDetailedEvaluationForUser: jest.fn(),
    createComment: jest.fn(),
    getEvaluationsAdmin: jest.fn(),
    getEvaluationsByCrpIdAndView: jest.fn(),
    getEvaluationsByIndicator: jest.fn(),
    query: jest.fn(),
    findAssessorsR1: jest.fn(),
    findAssessorsR2: jest.fn(),
    findOne: jest.fn(),
    getEvaluationStatus: jest.fn(),
  };
  const mockCrpRepository = { findActiveCRPs: jest.fn() };
  const mockCommentsRepository = {
    findOne: jest.fn(),
    findOneById: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    findOneWithTags: jest.fn(),
    findComments: jest.fn(),
    findCommentsWithReplies: jest.fn(),
    findTagsByCommentId: jest.fn(),
  };
  const mockTagsRepository = {
    findTagId: jest.fn(),
    findTagByCommentAndUser: jest.fn(),
    remove: jest.fn(),
    createTag: jest.fn(),
    findOneById: jest.fn(),
    delete: jest.fn(),
  };
  const mockReplyTypeRepository = { findOneById: jest.fn() };
  const mockCommentsRepliesRepository = {
    save: jest.fn(),
    findOneWithComment: jest.fn(),
    findRepliesByCommentId: jest.fn(),
  };
  const mockIndicatorsRepository = { findCriteriaByIndicatorName: jest.fn() };
  const mockAiHelperRepository = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationsService,
        { provide: EvaluationRepository, useValue: mockEvaluationRepository },
        { provide: CrpRepository, useValue: mockCrpRepository },
        { provide: CommentsRepository, useValue: mockCommentsRepository },
        { provide: TagsRepository, useValue: mockTagsRepository },
        { provide: ReplyTypeRepository, useValue: mockReplyTypeRepository },
        {
          provide: CommentsRepliesRepository,
          useValue: mockCommentsRepliesRepository,
        },
        { provide: IndicatorsRepository, useValue: mockIndicatorsRepository },
        { provide: AiHelperRepository, useValue: mockAiHelperRepository },
      ],
    }).compile();

    service = module.get<EvaluationsService>(EvaluationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getAllEvaluationsDash should return formatted data', async () => {
    mockEvaluationRepository.getUser.mockResolvedValue({
      roles: [{ qa_role: 1 }],
    });
    mockEvaluationRepository.getAllEvaluations.mockResolvedValue([
      {
        indicator_view_name: 'A',
        status: 'done',
        count: 2,
        indicator_status: 1,
        primary_field: 'f',
        indicator_order: 1,
        tpb_count: 0,
      },
    ]);
    mockEvaluationRepository.groupBy.mockReturnValue({ A: [{ value: 2 }] });

    const result = await service.getAllEvaluationsDash(undefined, {
      userId: 1,
      username: 'test',
      role: ['admin'],
    });
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('A');
  });

  it('getCRPS should return all CRPs', async () => {
    mockCrpRepository.findActiveCRPs.mockResolvedValue([{ id: 1 }]);
    const result = await service.getCRPS();
    expect(result.status).toBe(200);
    expect(result.data[0].id).toBe(1);
  });

  it('getIndicatorsByCrp should return indicators', async () => {
    mockEvaluationRepository.getIndicatorsByCrp.mockResolvedValue([{ id: 1 }]);
    const result = await service.getIndicatorsByCrp();
    expect(result.status).toBe(200);
    expect(result.data[0].id).toBe(1);
  });

  it('patchRequireChanges should return updated comment', async () => {
    mockCommentsRepository.findOneById.mockResolvedValue({ id: 1 });
    mockCommentsRepository.save.mockResolvedValue({
      id: 1,
      require_changes: true,
    });
    const result = await service.patchRequireChanges(1, true);
    expect(result.status).toBe(202);
    expect(result.data.require_changes).toBe(true);
  });

  it('patchRequireChanges should handle not found', async () => {
    mockCommentsRepository.findOneById.mockResolvedValue(null);
    const result = await service.patchRequireChanges(1, true);
    expect(result.status).toBe(400);
    expect(result.data).toEqual({});
  });

  it('getTagId should return tag id', async () => {
    mockTagsRepository.findTagId.mockResolvedValue(5);
    const result = await service.getTagId(1, 2, 3);
    expect(result.status).toBe(200);
    expect(result.data).toBe(5);
  });

  it('getTagId should handle not found', async () => {
    mockTagsRepository.findTagId.mockResolvedValue(null);
    const result = await service.getTagId(1, 2, 3);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('createTag should remove existing tag', async () => {
    mockTagsRepository.findTagByCommentAndUser.mockResolvedValue({ id: 1 });
    mockTagsRepository.remove.mockResolvedValue(undefined);
    const result = await service.createTag(1, 2, 3);
    expect(mockTagsRepository.findTagByCommentAndUser).toHaveBeenCalledWith(
      3,
      1,
    );
    expect(mockTagsRepository.remove).toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      message: 'Tag removed successfully.',
    });
  });

  it('createTag should create new tag', async () => {
    mockTagsRepository.findTagByCommentAndUser.mockResolvedValue(null);
    mockTagsRepository.createTag.mockResolvedValue({ id: 10 });
    const result = await service.createTag(1, 2, 3);
    expect(mockTagsRepository.createTag).toHaveBeenCalledWith(1, 2, 3);
    expect(result.data.id).toBe(10);
    expect(result.status).toBe(201);
  });

  it('createTag should handle error', async () => {
    mockTagsRepository.findTagByCommentAndUser.mockResolvedValue(null);
    mockTagsRepository.createTag.mockResolvedValue(undefined);
    const result = await service.createTag(1, 2, 3);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('deleteTag should delete tag', async () => {
    mockTagsRepository.findOneById.mockResolvedValue({ id: 1 });
    mockTagsRepository.delete.mockResolvedValue(undefined);
    const result = await service.deleteTag(1);
    expect(mockTagsRepository.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: 'Tag deleted successfully.' });
  });

  it('deleteTag should handle not found', async () => {
    mockTagsRepository.findOneById.mockResolvedValue(null);
    const result = await service.deleteTag(1);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('createComment should create comment', async () => {
    mockEvaluationRepository.createComment.mockResolvedValue({ id: 1 });
    const dto = { detail: 'test' };
    const result = await service.createComment(dto as any);
    expect(result.data.id).toBe(1);
    expect(result.status).toBe(201);
  });

  it('createComment should handle error', async () => {
    mockEvaluationRepository.createComment.mockRejectedValue(new Error('fail'));
    const dto = { detail: 'test' };
    const result = await service.createComment(dto as any);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('getCommentsReplies should return replies', async () => {
    mockCommentsRepliesRepository.findRepliesByCommentId.mockResolvedValue([
      { id: 1 },
    ]);
    const result = await service.getCommentsReplies(1);
    expect(result.data[0].id).toBe(1);
    expect(result.status).toBe(200);
  });

  it('getCommentsReplies should handle error', async () => {
    mockCommentsRepliesRepository.findRepliesByCommentId.mockRejectedValue(
      new Error('fail'),
    );
    const result = await service.getCommentsReplies(1);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('getCriteriaByIndicator should return criteria', async () => {
    mockIndicatorsRepository.findCriteriaByIndicatorName.mockResolvedValue([
      { id: 1 },
    ]);
    const result = await service.getCriteriaByIndicator('indicator');
    expect(result.data[0].id).toBe(1);
    expect(result.status).toBe(200);
  });

  it('getCriteriaByIndicator should handle not found', async () => {
    mockIndicatorsRepository.findCriteriaByIndicatorName.mockResolvedValue(
      null,
    );
    const result = await service.getCriteriaByIndicator('indicator');
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('getAssessorsByEvaluations should return assessors', async () => {
    mockEvaluationRepository.findAssessorsR1.mockResolvedValue([
      { assessed_r1: 'A' },
    ]);
    mockEvaluationRepository.findAssessorsR2.mockResolvedValue([
      { assessed_r2: 'B' },
    ]);
    const result = await service.getAssessorsByEvaluations(1);
    expect(result.data.assessed_r1).toBe('A');
    expect(result.data.assessed_r2).toBe('B');
    expect(result.status).toBe(200);
  });

  it('getAssessorsByEvaluations should handle error', async () => {
    mockEvaluationRepository.findAssessorsR1.mockRejectedValue(
      new Error('fail'),
    );
    const result = await service.getAssessorsByEvaluations(1);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });
  it('getListEvaluationsDash should return parsed data', async () => {
    mockEvaluationRepository.getUser.mockResolvedValue({
      roles: [{ qa_role: 1 }],
      crps: [],
    });
    mockEvaluationRepository.getEvaluationsAdmin.mockResolvedValue([{ id: 1 }]);
    mockEvaluationRepository.parseEvaluationsData.mockReturnValue([{ id: 1 }]);
    const result = await service.getListEvaluationsDash(
      1,
      'view',
      'field',
      undefined,
      { userId: 1, username: 'test', role: ['admin'] },
    );
    expect(result.status).toBe(200);
    expect(result.data[0].id).toBe(1);
  });

  it('getAllEvaluationsDashByCRP should return grouped data', async () => {
    mockEvaluationRepository.getUser.mockResolvedValue({
      roles: [{ qa_role: 1 }],
    });
    mockEvaluationRepository.getAllEvaluationsDash.mockResolvedValue([
      {
        indicator_view_name: 'A',
        status: 'done',
        count: 2,
        indicator_status: 1,
        primary_field: 'f',
        indicator_order: 1,
      },
    ]);
    mockEvaluationRepository.groupBy.mockReturnValue({ A: [{ value: 2 }] });
    const result = await service.getAllEvaluationsDashByCRP(undefined, {
      userId: 1,
      username: 'test',
      role: ['admin'],
    });
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('A');
  });

  it('getEvaluationsDash should return grouped user data', async () => {
    mockEvaluationRepository.getEvaluationsDashByUserId.mockResolvedValue([
      {
        indicator_view_name: 'A',
        status: 'done',
        enable_assessor: true,
        count: 2,
        primary_field: 'f',
        indicator_order: 1,
      },
    ]);
    mockEvaluationRepository.getType.mockReturnValue('type');
    mockEvaluationRepository.groupBy.mockReturnValue({ A: [{ value: 2 }] });
    const result = await service.getEvaluationsDash({ userId: 1 });
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('A');
  });

  it('getDetailedEvaluationDash should return mapped data', async () => {
    mockEvaluationRepository.getUser.mockResolvedValue({
      roles: [{ qa_role: 1 }],
      crps: [],
    });
    mockEvaluationRepository.getDetailedEvaluationForAdmin.mockResolvedValue([
      { col_name: 'gender_tag_level', result_code: 'RC' },
    ]);
    mockEvaluationRepository.parseEvaluationsData.mockReturnValue([
      { col_name: 'gender_tag_level', result_code: 'RC' },
    ]);
    mockEvaluationRepository.changedFieldsInitial.mockResolvedValue([
      { field: 'gender_tag_level', oldValue: 'old' },
    ]);
    mockEvaluationRepository.changedFieldsPhase.mockResolvedValue([
      { field: 'gender_tag_level', oldValue: 'old', newValue: 'new' },
    ]);
    mockAiHelperRepository.findOne.mockResolvedValue({
      gender_ai_prediction: 'pred',
      gender_ai_tag: 'tag',
      gender_ai_description: 'desc',
      gender_ai_matching: 'match',
    });
    const result = await service.getDetailedEvaluationDash(1, 'type', 2, {
      userId: 1,
      username: 'test',
      role: ['admin'],
    });
    expect(result.status).toBe(200);
    expect(result.data[0]).toHaveProperty('ai_prediction');
  });

  it('updateDetailedEvaluation should update and return evaluation', async () => {
    mockEvaluationRepository.findOneById.mockResolvedValue({
      id: 1,
      indicator_view_name: 'view',
      status: 'old',
    });
    mockEvaluationRepository.save.mockResolvedValue({
      id: 1,
      status: StatusHandler.Complete,
    });
    mockEvaluationRepository.getMetaIdByViewName.mockResolvedValue(1);
    const result = await service.updateDetailedEvaluation(
      1,
      1,
      StatusHandler.Complete,
      'ok',
    );
    expect(result.status).toBe(200);
    expect(result.data.status).toBe(StatusHandler.Complete);
  });

  it('patchHighlightComment should highlight a comment', async () => {
    mockCommentsRepository.findOne.mockResolvedValue({ id: 1 });
    mockCommentsRepository.save.mockResolvedValue({
      id: 1,
      highlight_comment: 1,
    });
    const user = { userId: 1, username: 'test', role: ['admin'] };
    const result = await service.patchHighlightComment(1, true, user);
    expect(result.status).toBe(201);
    expect(result.data.highlight_comment).toBe(1);
  });

  it('patchHighlightComment should remove highlight', async () => {
    mockCommentsRepository.findOne.mockResolvedValue({ id: 1 });
    mockCommentsRepository.update.mockResolvedValue(undefined);
    const user = { userId: 1, username: 'test', role: ['admin'] };
    const result = await service.patchHighlightComment(1, false, user);
    expect(result.status).toBe(201);
    expect(result.data).toEqual({});
  });

  it('createCommentReply should create a reply', async () => {
    mockEvaluationRepository.getUser.mockResolvedValue({
      roles: [{ qa_role: 2 }],
    });
    mockCommentsRepository.findOneById.mockResolvedValue({ id: 1 });
    mockReplyTypeRepository.findOneById.mockResolvedValue({ id: 1 });
    mockCommentsRepliesRepository.save.mockResolvedValue({ id: 1 });
    const dto = {
      detail: 'reply',
      userId: 1,
      commentId: 1,
      crp_approved: true,
      approved: true,
      replyTypeId: 1,
    };
    const result = await service.createCommentReply(dto as any);
    expect(result.status).toBe(201);
    expect(result.data.id).toBe(1);
  });

  it('updateComment should update a comment', async () => {
    mockCommentsRepository.findOneWithTags.mockResolvedValue({
      id: 1,
      tags: [],
    });
    mockTagsRepository.remove.mockResolvedValue(undefined);
    mockCommentsRepository.save.mockResolvedValue({ id: 1, detail: 'updated' });
    const dto = { id: 1, detail: 'updated', is_deleted: true };
    const result = await service.updateComment(dto as any);
    expect(result.status).toBe(200);
    expect(result.data.detail).toBe('updated');
  });

  it('updateCommentReply should update a reply', async () => {
    mockCommentsRepliesRepository.findOneWithComment.mockResolvedValue({
      id: 1,
    });
    mockCommentsRepliesRepository.save.mockResolvedValue({
      id: 1,
      detail: 'updated',
    });
    const dto = { id: 1, detail: 'updated' };
    const result = await service.updateCommentReply(dto as any);
    expect(result.status).toBe(200);
    expect(result.data.detail).toBe('updated');
  });

  it('getComments should return comments with replies and tags', async () => {
    mockCommentsRepository.findComments.mockResolvedValue([{ id: 1 }]);
    mockCommentsRepository.findCommentsWithReplies.mockResolvedValue([
      { id: 2 },
    ]);
    mockCommentsRepository.findTagsByCommentId.mockResolvedValue([{ id: 3 }]);
    const result = await service.getComments(1, 2);
    expect(result.status).toBe(200);
    expect(result.data[0].replies[0].id).toBe(2);
    expect(result.data[0].tags[0].id).toBe(3);
  });

  it('updateRequireSecondEvaluation should update evaluation', async () => {
    mockEvaluationRepository.findOne.mockResolvedValue({ id: 1 });
    mockEvaluationRepository.save.mockResolvedValue({
      id: 1,
      require_second_assessment: true,
    });
    const result = await service.updateRequireSecondEvaluation(1, true);
    expect(result.status).toBe(200);
    expect(result.data.require_second_assessment).toBe(true);
  });

  it('pendingHighlights should return highlights', async () => {
    mockEvaluationRepository.query.mockResolvedValue([
      {
        pending_highlight_comments: 2,
        total_tpb_comments: 1,
        solved_with_require_request: 1,
        solved_without_require_request: 1,
        pending_tpb_decisions: 1,
        indicator_view_name: 'A',
      },
    ]);
    const result = await service.pendingHighlights('');
    expect(result.status).toBe(200);
    expect(result.data[0].indicator_view_name).toBe('A');
  });

  it('getEvaluationStatus should return status', async () => {
    mockEvaluationRepository.getEvaluationStatus.mockResolvedValue([
      { indicator_view_id: 1, evaluations_status: 'done' },
    ]);
    const result = await service.getEvaluationStatus('resultId');
    expect(result.status).toBe(200);
    expect(result.data[0].evaluations_status).toBe('done');
  });

  it('getListEvaluationsDash should handle error', async () => {
    mockEvaluationRepository.getUser.mockRejectedValue(new Error('fail'));
    const result = await service.getListEvaluationsDash(
      1,
      'view',
      'field',
      undefined,
      {
        userId: 1,
        username: 'test',
        role: ['admin'],
      },
    );
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('getAllEvaluationsDashByCRP should handle error', async () => {
    mockEvaluationRepository.getUser.mockRejectedValue(new Error('fail'));
    const result = await service.getAllEvaluationsDashByCRP(undefined, {
      userId: 1,
      username: 'test',
      role: ['admin'],
    });
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('getEvaluationsDash should handle error', async () => {
    mockEvaluationRepository.getEvaluationsDashByUserId.mockRejectedValue(
      new Error('fail'),
    );
    const result = await service.getEvaluationsDash({
      userId: 1,
      username: 'test',
      role: ['admin'],
    });
    expect(result.status).toBe(500);
    expect(result.data).toEqual({});
  });

  it('getDetailedEvaluationDash should handle error', async () => {
    mockEvaluationRepository.getUser.mockRejectedValue(new Error('fail'));
    const result = await service.getDetailedEvaluationDash(1, 'type', 2, {
      userId: 1,
      username: 'test',
      role: ['admin'],
    });
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('updateDetailedEvaluation should handle not found', async () => {
    mockEvaluationRepository.findOneById.mockResolvedValue(null);
    const result = await service.updateDetailedEvaluation(
      1,
      1,
      StatusHandler.Complete,
      'ok',
    );
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('patchHighlightComment should handle not found', async () => {
    mockCommentsRepository.findOne.mockResolvedValue(null);
    const user = { userId: 1, username: 'test', role: ['admin'] };
    const result = await service.patchHighlightComment(1, true, user);
    expect(result.status).toBe(500);
    expect(result.data).toEqual({});
  });

  it('createCommentReply should handle invalid data', async () => {
    mockEvaluationRepository.getUser.mockResolvedValue(null);
    const dto = {
      detail: 'reply',
      userId: 1,
      commentId: 1,
      crp_approved: true,
      approved: true,
      replyTypeId: 1,
    };
    const result = await service.createCommentReply(dto as any);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('updateComment should handle not found', async () => {
    mockCommentsRepository.findOneWithTags.mockResolvedValue(null);
    const dto = { id: 1, detail: 'updated', is_deleted: true };
    const result = await service.updateComment(dto as any);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('updateCommentReply should handle not found', async () => {
    mockCommentsRepliesRepository.findOneWithComment.mockResolvedValue(null);
    const dto = { id: 1, detail: 'updated' };
    const result = await service.updateCommentReply(dto as any);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('getComments should handle error', async () => {
    mockCommentsRepository.findComments.mockRejectedValue(new Error('fail'));
    const result = await service.getComments(1, 2);
    expect(result.status).toBe(404);
    expect(result.data).toBeNull();
  });

  it('updateRequireSecondEvaluation should handle not found', async () => {
    mockEvaluationRepository.findOne.mockResolvedValue(null);
    const result = await service.updateRequireSecondEvaluation(1, true);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('pendingHighlights should handle error', async () => {
    mockEvaluationRepository.query.mockRejectedValue(new Error('fail'));
    const result = await service.pendingHighlights('');
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });

  it('getEvaluationStatus should handle error', async () => {
    mockEvaluationRepository.getEvaluationStatus.mockRejectedValue(
      new Error('fail'),
    );
    const result = await service.getEvaluationStatus('resultId');
    expect(result.status).toBe(404);
    expect(result.data).toEqual({});
  });
});
