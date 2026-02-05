import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { TokenDto } from '../../shared/global-dto/token.dto';
import { StatusHandler } from './enum/status-handler.enum';
import { UserRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';

describe('EvaluationsController', () => {
  let controller: EvaluationsController;
  let service: EvaluationsService;
  const user: TokenDto = { userId: 1, username: 'test', role: ['admin'] };

  const mockEvaluationsService = {
    getAllEvaluationsDash: jest.fn(),
    getAllEvaluationsDashByCRP: jest.fn(),
    getEvaluationsDash: jest.fn(),
    getListEvaluationsDash: jest.fn(),
    getDetailedEvaluationDash: jest.fn(),
    updateDetailedEvaluation: jest.fn(),
    getCRPS: jest.fn(),
    getIndicatorsByCrp: jest.fn(),
    patchHighlightComment: jest.fn(),
    patchRequireChanges: jest.fn(),
    getTagId: jest.fn(),
    createTag: jest.fn(),
    deleteTag: jest.fn(),
    createComment: jest.fn(),
    createCommentReply: jest.fn(),
    updateComment: jest.fn(),
    updateCommentReply: jest.fn(),
    getComments: jest.fn(),
    getCommentsReplies: jest.fn(),
    getCriteriaByIndicator: jest.fn(),
    getAssessorsByEvaluations: jest.fn(),
    updateRequireSecondEvaluation: jest.fn(),
    pendingHighlights: jest.fn(),
    getEvaluationStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationsController],
      providers: [
        { provide: EvaluationsService, useValue: mockEvaluationsService },
        { provide: UserRepository, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<EvaluationsController>(EvaluationsController);
    service = module.get<EvaluationsService>(EvaluationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getAllEvaluationsDash', async () => {
    mockEvaluationsService.getAllEvaluationsDash.mockResolvedValue('result');
    const result = await controller.getAllEvaluationsDash(user, 'crp1');
    expect(service.getAllEvaluationsDash).toHaveBeenCalledWith('crp1', user);
    expect(result).toBe('result');
  });

  it('should call getAllEvaluationsDashByCRP', async () => {
    mockEvaluationsService.getAllEvaluationsDashByCRP.mockResolvedValue(
      'result',
    );
    const result = await controller.getAllEvaluationsDashByCRP(user, 'crp1');
    expect(service.getAllEvaluationsDashByCRP).toHaveBeenCalledWith(
      'crp1',
      user,
    );
    expect(result).toBe('result');
  });

  it('should call getEvaluationsDash', async () => {
    mockEvaluationsService.getEvaluationsDash.mockResolvedValue('result');

    const result = await controller.getEvaluationsDash(user, 2);
    expect(service.getEvaluationsDash).toHaveBeenCalledWith(2);
    expect(result).toBe('result');
  });

  it('should call getListEvaluationsDash', async () => {
    mockEvaluationsService.getListEvaluationsDash.mockResolvedValue('result');
    const dto = { view_name: 'view', view_primary_field: 'field' };
    const result = await controller.getListEvaluationsDash(
      user,
      2,
      dto,
      'crp1',
    );
    expect(service.getListEvaluationsDash).toHaveBeenCalledWith(
      2,
      'view',
      'field',
      'crp1',
      user,
      undefined,
    );
    expect(result).toBe('result');
  });

  it('should call getDetailedEvaluationDash', async () => {
    mockEvaluationsService.getDetailedEvaluationDash.mockResolvedValue(
      'result',
    );
    const dto = { type: 'type', indicatorId: 3 };
    const result = await controller.getDetailedEvaluationDash(user, 2, dto);
    expect(service.getDetailedEvaluationDash).toHaveBeenCalledWith(
      2,
      'type',
      3,
      user,
    );
    expect(result).toBe('result');
  });

  it('should call updateDetailedEvaluation', async () => {
    mockEvaluationsService.updateDetailedEvaluation.mockResolvedValue('result');
    const dto = { status: StatusHandler.Complete, general_comments: 'ok' };
    const result = await controller.updateDetailedEvaluation(user, 2, dto);
    expect(service.updateDetailedEvaluation).toHaveBeenCalledWith(
      2,
      user.userId,
      StatusHandler.Complete,
      'ok',
    );
    expect(result).toBe('result');
  });

  it('should call getCRPS', async () => {
    mockEvaluationsService.getCRPS.mockResolvedValue('result');
    const result = await controller.getCRPS();
    expect(service.getCRPS).toHaveBeenCalled();
    expect(result).toBe('result');
  });

  it('should call getIndicatorsByCrp', async () => {
    mockEvaluationsService.getIndicatorsByCrp.mockResolvedValue('result');
    const result = await controller.getIndicatorsByCrp();
    expect(service.getIndicatorsByCrp).toHaveBeenCalled();
    expect(result).toBe('result');
  });

  it('should call getIndicatorsByCrp', async () => {
    mockEvaluationsService.getIndicatorsByCrp.mockResolvedValue('result');
    const result = await controller.getIndicatorsByCrp();
    expect(service.getIndicatorsByCrp).toHaveBeenCalled();
    expect(result).toBe('result');
  });

  it('should call patchHighlightComment', async () => {
    mockEvaluationsService.patchHighlightComment.mockResolvedValue('patched');
    const dto = { highlight_comment: true, id: 1 };
    const result = await controller.patchHighlightComment(user, dto);
    expect(service.patchHighlightComment).toHaveBeenCalledWith(1, true, user);
    expect(result).toBe('patched');
  });

  it('should call patchRequireChanges', async () => {
    mockEvaluationsService.patchRequireChanges.mockResolvedValue('patched');
    const dto = { id: 1, require_changes: true };
    const result = await controller.patchRequireChanges(dto);
    expect(service.patchRequireChanges).toHaveBeenCalledWith(1, true);
    expect(result).toBe('patched');
  });

  it('should call getTagId', async () => {
    mockEvaluationsService.getTagId.mockResolvedValue('tagId');
    const result = await controller.getTagId(1, 2, 3);
    expect(service.getTagId).toHaveBeenCalledWith(1, 2, 3);
    expect(result).toBe('tagId');
  });

  it('should call createTag', async () => {
    mockEvaluationsService.createTag.mockResolvedValue('created');
    const dto = { userId: 1, tagTypeId: 2, commentId: 3 };
    const result = await controller.createTag(dto);
    expect(service.createTag).toHaveBeenCalledWith(1, 2, 3);
    expect(result).toBe('created');
  });

  it('should call deleteTag', async () => {
    mockEvaluationsService.deleteTag.mockResolvedValue('deleted');
    const result = await controller.deleteTag(1);
    expect(service.deleteTag).toHaveBeenCalledWith(1);
    expect(result).toBe('deleted');
  });

  it('should call createComment', async () => {
    mockEvaluationsService.createComment.mockResolvedValue('created');
    const dto = { text: 'comment', evaluationId: 1 };
    const result = await controller.createComment(dto as any);
    expect(service.createComment).toHaveBeenCalledWith(dto);
    expect(result).toBe('created');
  });

  it('should call createCommentReply', async () => {
    mockEvaluationsService.createCommentReply.mockResolvedValue('replyCreated');
    const dto = { text: 'reply', commentId: 1 };
    const result = await controller.createCommentReply(dto as any);
    expect(service.createCommentReply).toHaveBeenCalledWith(dto);
    expect(result).toBe('replyCreated');
  });

  it('should call updateComment', async () => {
    mockEvaluationsService.updateComment.mockResolvedValue('updated');
    const dto = { id: 1, text: 'updated comment' };
    const result = await controller.updateComment(dto as any);
    expect(service.updateComment).toHaveBeenCalledWith(dto);
    expect(result).toBe('updated');
  });

  it('should call updateCommentReply', async () => {
    mockEvaluationsService.updateCommentReply.mockResolvedValue('replyUpdated');
    const dto = { id: 1, text: 'updated reply' };
    const result = await controller.updateCommentReply(dto as any);
    expect(service.updateCommentReply).toHaveBeenCalledWith(dto);
    expect(result).toBe('replyUpdated');
  });

  it('should call getComments', async () => {
    mockEvaluationsService.getComments.mockResolvedValue('comments');
    const result = await controller.getComments(1, 2);
    expect(service.getComments).toHaveBeenCalledWith(1, 2);
    expect(result).toBe('comments');
  });

  it('should call getCommentsReplies', async () => {
    mockEvaluationsService.getCommentsReplies.mockResolvedValue('replies');
    const result = await controller.getCommentsReplies(1);
    expect(service.getCommentsReplies).toHaveBeenCalledWith(1);
    expect(result).toBe('replies');
  });

  it('should call getCriteriaByIndicator', async () => {
    mockEvaluationsService.getCriteriaByIndicator.mockResolvedValue('criteria');
    const result = await controller.getCriteriaByIndicator('indicatorName');
    expect(service.getCriteriaByIndicator).toHaveBeenCalledWith(
      'indicatorName',
    );
    expect(result).toBe('criteria');
  });

  it('should call getAssessorsByEvaluations', async () => {
    mockEvaluationsService.getAssessorsByEvaluations.mockResolvedValue(
      'assessors',
    );
    const result = await controller.getAssessorsByEvaluations(1);
    expect(service.getAssessorsByEvaluations).toHaveBeenCalledWith(1);
    expect(result).toBe('assessors');
  });

  it('should call updateRequireSecondEvaluation', async () => {
    mockEvaluationsService.updateRequireSecondEvaluation.mockResolvedValue(
      'updated',
    );
    const dto = { require_second_assessment: true };
    const result = await controller.updateRequireSecondEvaluation(
      1,
      dto as any,
    );
    expect(service.updateRequireSecondEvaluation).toHaveBeenCalledWith(1, true);
    expect(result).toBe('updated');
  });

  it('should call pendingHighlights', async () => {
    mockEvaluationsService.pendingHighlights.mockResolvedValue('pending');
    const result = await controller.pendingHighlights('someType');
    expect(service.pendingHighlights).toHaveBeenCalledWith('someType');
    expect(result).toBe('pending');
  });

  it('should call getEvaluationStatus', async () => {
    mockEvaluationsService.getEvaluationStatus.mockResolvedValue('status');
    const result = await controller.getEvaluationStatus('1');
    expect(service.getEvaluationStatus).toHaveBeenCalledWith('1');
    expect(result).toBe('status');
  });
});
