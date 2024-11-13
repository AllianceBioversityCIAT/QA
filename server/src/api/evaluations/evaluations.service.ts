import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EvaluationRepository } from './repositories/evaluation.repository';
import { UserRepository } from '../users/users.repository';
import { RolesHandler } from '../../shared/enum/roles-handler.enum';
import { StatusHandler } from './enum/status-handler.enum';
import { ResponseUtils } from '../../utils/response.utils';
import { TokenDto } from '../../shared/global-dto/token.dto';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { CommentsRepository } from '../comments/repositories/comments.repository';
import { TagsRepository } from '../comments/repositories/tags.repository';
import {
  CreateCommentDto,
  CreateReplyDto,
  UpdateCommentDto,
  UpdateReplyDto,
} from './dto/evaluation.dto';
import { ReplyTypeRepository } from '../comments/repositories/reply-type.repository';
import { CommentsRepliesRepository } from '../comments/repositories/comments-reply.repository';
import { IndicatorsRepository } from '../indicators/repositories/indicators.repository';

@Injectable()
export class EvaluationsService {
  private readonly _logger = new Logger(EvaluationsService.name);

  constructor(
    private readonly _evaluationsRepository: EvaluationRepository,
    private readonly _crpRepository: CrpRepository,
    private readonly _commentRepository: CommentsRepository,
    private readonly _tagsRepository: TagsRepository,
    private readonly _replyTypeRepository: ReplyTypeRepository,
    private readonly _commentReplyRepository: CommentsRepliesRepository,
    private readonly _indicatorRepository: IndicatorsRepository,
  ) {}

  async getAllEvaluationsDash(
    crpId: string | undefined,
    user: TokenDto,
  ): Promise<any> {
    const uData = await this._evaluationsRepository.getUser(user.userId);
    try {
      let rawData;
      if (crpId !== undefined && crpId !== 'undefined') {
        rawData = await this._evaluationsRepository.getEvaluationsByCrpId(
          crpId,
          uData.roles[0].qa_role,
        );
      } else {
        rawData = await this._evaluationsRepository.getAllEvaluations();
      }

      const response = rawData.map((element) => ({
        indicator_view_name: element['indicator_view_name'],
        status: element['status']
          ? element['status']
          : element['evaluations_status'],
        type: this._evaluationsRepository.getType(
          element['status'] ? element['status'] : element['evaluations_status'],
          crpId !== undefined && crpId !== 'undefined',
        ),
        value: element['count'],
        indicator_status: element['indicator_status'],
        crp_id: crpId ? element['crp_id'] : null,
        label: `${element['count']}`,
        primary_field: element['primary_field'],
        order: element['indicator_order'],
        tpb_count: element['tpb_count'],
      }));

      const data = this._evaluationsRepository.groupBy(
        response,
        'indicator_view_name',
      );
      return ResponseUtils.format({
        data: data,
        status: HttpStatus.OK,
        description: 'All evaluations retrieved successfully.',
      });
    } catch (error) {
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Error retrieving evaluations.',
      });
    }
  }

  async getListEvaluationsDash(
    id: number,
    viewName: string,
    viewPrimaryField: string,
    crpId: string | undefined,
    user: TokenDto,
  ): Promise<any> {
    try {
      const userEntity = await this._evaluationsRepository.getUser(user.userId);
      const isAdmin = userEntity.roles.some((r) => r.qa_role === 1);

      let rawData;

      if (isAdmin && (!crpId || crpId === 'undefined' || crpId === undefined)) {
        rawData =
          await this._evaluationsRepository.getEvaluationsAdmin(viewName);
        this._logger.log('Admin - getListEvaluationsDash');
      } else if (userEntity.crps.length > 0) {
        rawData =
          await this._evaluationsRepository.getEvaluationsByCrpIdAndView(
            viewName,
            crpId,
          );
        this._logger.log('CRP - getListEvaluationsDash');
      } else {
        rawData = await this._evaluationsRepository.getEvaluationsByIndicator(
          id,
          viewName,
        );
        this._logger.log('Assessor - getListEvaluationsDash');
      }

      const data = this._evaluationsRepository.parseEvaluationsData(rawData);
      return ResponseUtils.format({
        data,
        status: HttpStatus.OK,
        description: 'Evaluations list retrieved successfully.',
      });
    } catch (error) {
      this._logger.error('Error retrieving evaluations list:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Error retrieving evaluations list.',
      });
    }
  }

  async getAllEvaluationsDashByCRP(
    crpId: string | undefined,
    user: TokenDto,
  ): Promise<any> {
    try {
      const userData = await this._evaluationsRepository.getUser(user.userId);

      let rawData;
      if (crpId && crpId !== 'undefined') {
        rawData =
          await this._evaluationsRepository.getEvaluationsDashByCRP(crpId);
      } else {
        rawData = await this._evaluationsRepository.getAllEvaluationsDash();
      }

      const response = rawData.map((element) => ({
        indicator_view_name: element['indicator_view_name'],
        status: element['status'] || element['evaluations_status'],
        type: this._evaluationsRepository.getType(
          element['status'] || element['evaluations_status'],
          !!crpId,
        ),
        value: element['count'],
        indicator_status: element['indicator_status'],
        crp_id: crpId ? element['crp_id'] : null,
        label: `${element['count']}`,
        primary_field: element['primary_field'],
        order: element['indicator_order'],
      }));

      const result = this._evaluationsRepository.groupBy(
        response,
        'indicator_view_name',
      );

      return ResponseUtils.format({
        data: result,
        description: 'All evaluations by CRP retrieved successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error retrieving evaluations by CRP:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Error retrieving evaluations by CRP.',
      });
    }
  }

  async getEvaluationsDash(user: any): Promise<any> {
    try {
      const rawData =
        await this._evaluationsRepository.getEvaluationsDashByUserId(user);

      if (rawData.length === 0) {
        return ResponseUtils.format({
          data: [],
          description: 'No evaluations found for this user.',
          status: HttpStatus.NOT_FOUND,
        });
      }

      const response = rawData.map((element) => ({
        indicator_view_name: element['indicator_view_name'],
        status: element['status'],
        indicator_status: element['enable_assessor'],
        type: this._evaluationsRepository.getType(element['status']),
        value: element['count'],
        label: `${element['count']}`,
        primary_field: element['primary_field'],
        order: element['indicator_order'],
      }));

      const groupedResponse = this._evaluationsRepository.groupBy(
        response,
        'indicator_view_name',
      );

      return ResponseUtils.format({
        data: groupedResponse,
        status: HttpStatus.OK,
        description: 'User evaluations retrieved successfully.',
      });
    } catch (error) {
      this._logger.error('Error retrieving evaluations:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Error retrieving evaluations.',
      });
    }
  }

  async getDetailedEvaluationDash(
    userId: number,
    type: string,
    indicatorId: number,
    user: TokenDto,
  ): Promise<any> {
    const viewName = `qa_${type}`;
    const viewNamePsdo = `${type}`;

    try {
      const userData = await this._evaluationsRepository.getUser(userId);
      const isAdmin = userData.roles.some((r) => r.qa_role === 1);

      let rawData;
      if (isAdmin) {
        rawData =
          await this._evaluationsRepository.getDetailedEvaluationForAdmin(
            userId,
            viewName,
            viewNamePsdo,
            indicatorId,
          );
        this._logger.log('Admin - getDetailedEvaluationDash');
      } else if (userData.crps.length > 0) {
        rawData = await this._evaluationsRepository.getDetailedEvaluationForCrp(
          userId,
          viewName,
          viewNamePsdo,
          indicatorId,
        );
        this._logger.log('CRP - getDetailedEvaluationDash');
      } else {
        rawData =
          await this._evaluationsRepository.getDetailedEvaluationForUser(
            userId,
            viewName,
            viewNamePsdo,
            indicatorId,
          );
        this._logger.log('Assessor - getDetailedEvaluationDash');
      }

      const parsedData = this._evaluationsRepository.parseEvaluationsData(
        rawData,
        viewNamePsdo,
      );

      const changedDataInitial =
        await this._evaluationsRepository.changedFieldsInitial(
          viewName,
          indicatorId,
        );

      const changedDataPhase =
        await this._evaluationsRepository.changedFieldsPhase(
          viewName,
          indicatorId,
        );

      const mappedData = this.mapFieldsWithChanges(
        parsedData,
        changedDataInitial,
        changedDataPhase,
      );

      return ResponseUtils.format({
        data: mappedData,
        status: HttpStatus.OK,
        description: 'User evaluation detail retrieved successfully.',
      });
    } catch (error) {
      this._logger.error('Error retrieving user evaluation detail:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Error retrieving user evaluation detail.',
      });
    }
  }

  /**
   * Map the parsedData fields to changedFields and add a boolean.
   */
  mapFieldsWithChanges(
    parsedData: any[],
    changedDataInitial: any[],
    changedDataPhase: any[],
  ): any[] {
    if (!parsedData || !changedDataInitial || !changedDataPhase) {
      return [];
    }

    return parsedData.map((parsed) => {
      const matchInitial = changedDataInitial.find(
        (changed) => changed.field === parsed.col_name,
      );

      const matchPhase = changedDataPhase.find(
        (changed) =>
          changed.field === parsed.col_name && parsed.changes_updated === 1,
      );

      return {
        ...parsed,
        hasChanged: !!matchInitial,
        changedDataInitial: matchInitial ? matchInitial.oldValue : null,
        hasChangePrevious: !!matchPhase,
        changedOldValue: matchPhase ? matchPhase.oldValue : null,
        changedNewValue: matchPhase ? matchPhase.newValue : null,
      };
    });
  }

  async updateDetailedEvaluation(
    id: number,
    userId: number,
    status: StatusHandler,
    generalComments?: string,
  ): Promise<any> {
    try {
      const evaluation = await this._evaluationsRepository.findOneById(id);
      if (!evaluation) {
        throw new Error('Evaluation not found');
      }

      evaluation.status = status;

      let metaId = null;
      if (status === StatusHandler.Finalized) {
        metaId = await this._evaluationsRepository.getMetaIdByViewName(
          evaluation.indicator_view_name,
        );
      }

      const updatedEvaluation =
        await this._evaluationsRepository.save(evaluation);

      return ResponseUtils.format({
        data: updatedEvaluation,
        status: HttpStatus.OK,
        description: 'Evaluation updated successfully.',
      });
    } catch (error) {
      this._logger.error('Error updating evaluation:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Error updating evaluation.',
      });
    }
  }

  async getCRPS(): Promise<any> {
    try {
      const allCRP = await this._crpRepository.findActiveCRPs();
      return ResponseUtils.format({
        data: allCRP,
        status: HttpStatus.OK,
        description: 'All CRPs retrieved successfully.',
      });
    } catch (error) {
      this._logger.error('Error retrieving CRPs:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Could not retrieve CRPs.',
      });
    }
  }

  async getIndicatorsByCrp(): Promise<any> {
    try {
      const indicators = await this._evaluationsRepository.getIndicatorsByCrp();
      return ResponseUtils.format({
        data: indicators,
        status: HttpStatus.OK,
        description: 'Indicators settings retrieved successfully.',
      });
    } catch (error) {
      this._logger.error('Error retrieving indicators settings:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Could not retrieve indicators settings.',
      });
    }
  }

  async patchHighlightComment(
    commentId: number,
    highlightComment: boolean,
    user: TokenDto,
  ): Promise<any> {
    try {
      const comment = await this._commentRepository.findOne({
        where: { id: commentId },
      });

      if (!comment) {
        throw new Error('Comment not found');
      }

      if (highlightComment) {
        comment.highlight_by = user.userId;
        comment.highlight_comment = highlightComment ? 1 : 0;

        const updatedComment = await this._commentRepository.save(comment);
        const message = `Assessment highlighted by ${user.username}`;
        return ResponseUtils.format({
          data: updatedComment,
          status: HttpStatus.CREATED,
          description: message,
        });
      } else {
        await this._commentRepository.update(commentId, {
          highlight_by: null,
          highlight_comment: 0,
        });

        const message = `Highlight mark was removed in comment by ${user.username}`;
        return ResponseUtils.format({
          data: {},
          status: HttpStatus.CREATED,
          description: message,
        });
      }
    } catch (error) {
      this._logger.error('Error updating highlight status:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Could not update highlight status.',
      });
    }
  }

  async patchRequireChanges(id: number, requireChanges: boolean): Promise<any> {
    try {
      const comment = await this._commentRepository.findOneById(id);

      if (!comment) {
        throw new Error('Comment not found');
      }

      comment.require_changes = requireChanges;
      const updatedComment = await this._commentRepository.save(comment);

      const message = requireChanges
        ? 'The TPB instruction was successfully created with require changes'
        : 'The TPB instruction was successfully created';

      return ResponseUtils.format({
        data: updatedComment,
        status: HttpStatus.ACCEPTED,
        description: message,
      });
    } catch (error) {
      this._logger.error('Error marking require changes:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.BAD_REQUEST,
        description: 'Error occurred while marking require changes.',
      });
    }
  }

  async getTagId(
    commentId: number,
    tagTypeId: number,
    userId: number,
  ): Promise<any> {
    try {
      const tagId = await this._tagsRepository.findTagId(
        commentId,
        tagTypeId,
        userId,
      );

      if (!tagId) {
        throw new Error('Tag ID not found');
      }

      return ResponseUtils.format({
        data: tagId,
        status: HttpStatus.OK,
        description: 'Tag ID found successfully.',
      });
    } catch (error) {
      this._logger.error('Error retrieving tag ID:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Tag ID could not be found.',
      });
    }
  }

  async createTag(
    userId: number,
    tagTypeId: number,
    commentId: number,
  ): Promise<any> {
    try {
      const existingTag = await this._tagsRepository.findTagByCommentAndUser(
        commentId,
        userId,
      );

      if (existingTag) {
        await this._tagsRepository.remove(existingTag);
        return {
          data: null,
          message: 'Tag removed successfully.',
        };
      }

      const newTag = await this._tagsRepository.createTag(
        userId,
        tagTypeId,
        commentId,
      );
      if (!newTag) {
        throw new Error('Could not create tag');
      }

      return ResponseUtils.format({
        data: newTag,
        status: HttpStatus.CREATED,
        description: 'Tag created successfully.',
      });
    } catch (error) {
      this._logger.error('Error creating or removing tag:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Tag could not be created or removed.',
      });
    }
  }

  async deleteTag(id: number): Promise<any> {
    try {
      const tag = await this._tagsRepository.findOneById(id);
      if (!tag) {
        throw new Error('Tag not found');
      }

      await this._tagsRepository.delete(id);
      return { message: 'Tag deleted successfully.' };
    } catch (error) {
      this._logger.error('Error deleting tag:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Tag could not be deleted.',
      });
    }
  }

  async createComment(createCommentDto: CreateCommentDto): Promise<any> {
    try {
      const newComment =
        await this._evaluationsRepository.createComment(createCommentDto);

      if (!newComment) {
        this._logger.error('Could not create comment');
      }

      return ResponseUtils.format({
        data: newComment,
        status: HttpStatus.CREATED,
        description: 'Comment created successfully',
      });
    } catch (error) {
      this._logger.error('Error creating comment:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Comment could not be created.',
      });
    }
  }

  async createCommentReply(createReplyDto: CreateReplyDto): Promise<any> {
    const { detail, userId, commentId, crp_approved, approved, replyTypeId } =
      createReplyDto;

    try {
      const user = await this._evaluationsRepository.getUser(userId);
      const comment = await this._commentRepository.findOneById(commentId);
      const replyType =
        await this._replyTypeRepository.findOneById(replyTypeId);

      if (!user || !comment || !replyType) {
        throw new Error('Invalid data for creating reply.');
      }

      comment.replyType = replyType;

      const newReply = await this._commentReplyRepository.save({
        detail,
        user: userId,
        comment: commentId,
        crp_approved,
        approved,
      });

      if (user.roles.some((role) => role.qa_role === 3)) {
        comment.crp_approved = crp_approved;
        await this._commentRepository.save(comment);
      }

      return ResponseUtils.format({
        data: newReply,
        status: HttpStatus.CREATED,
        description: 'Reply created successfully',
      });
    } catch (error) {
      this._logger.error('Error creating reply:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Reply could not be created.',
      });
    }
  }

  async updateComment(updateCommentDto: UpdateCommentDto): Promise<any> {
    const {
      approved,
      is_visible,
      is_deleted,
      id,
      detail,
      userId,
      require_changes,
      tpb,
    } = updateCommentDto;

    try {
      const comment = await this._commentRepository.findOneWithTags(id);

      if (!comment) {
        throw new Error('Comment not found');
      }

      if (is_deleted) {
        await this._tagsRepository.remove(comment.tags);
      }

      comment.approved = approved;
      comment.is_deleted = is_deleted;
      comment.is_visible = is_visible;
      comment.require_changes = require_changes;
      comment.tpb = tpb;

      if (detail) comment.detail = detail;
      if (userId) comment.userId = userId;

      const updatedComment = await this._commentRepository.save(comment);

      return ResponseUtils.format({
        data: updatedComment,
        status: HttpStatus.OK,
        description: 'Comment updated successfully',
      });
    } catch (error) {
      this._logger.error('Error updating comment:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Comment could not be updated.',
      });
    }
  }

  async updateCommentReply(updateReplyDto: UpdateReplyDto): Promise<any> {
    const { is_deleted, id, detail, userId } = updateReplyDto;

    try {
      const reply = await this._commentReplyRepository.findOneWithComment(id);

      if (!reply) {
        throw new Error('Reply not found');
      }

      reply.is_deleted = is_deleted;
      if (detail) reply.detail = detail;
      if (userId) reply.user = userId;

      if (is_deleted) {
        const comment = await this._commentRepository.findOne({
          where: {
            id: reply.comment,
          },
        });
        if (comment) {
          comment.crp_approved = null;
          comment.replyType = null;
          await this._commentRepository.save(comment);
        }
      }

      const updatedReply = await this._commentReplyRepository.save(reply);

      return ResponseUtils.format({
        data: updatedReply,
        status: HttpStatus.OK,
        description: 'Reply updated successfully',
      });
    } catch (error) {
      this._logger.error('Error updating reply:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Reply could not be updated.',
      });
    }
  }

  async getComments(evaluationId: number, metaId: number): Promise<any> {
    try {
      const comments = await this._commentRepository.findComments(
        metaId,
        evaluationId,
      );

      for (const comment of comments) {
        const replies = await this._commentRepository.findCommentsWithReplies(
          evaluationId,
          metaId,
        );
        comment.replies = replies;

        const tags = await this._commentRepository.findTagsByCommentId(
          comment.id,
        );
        comment.tags = tags;
      }

      return ResponseUtils.format({
        data: comments,
        status: HttpStatus.OK,
        description: 'All comments retrieved successfully.',
      });
    } catch (error) {
      this._logger.error('Error retrieving comments:', error);
      return ResponseUtils.format({
        data: null,
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Could not retrieve any comments.',
      });
    }
  }

  async getCommentsReplies(commentId: number): Promise<any> {
    if (!commentId) {
      throw new Error('Comment ID not provided.');
    }

    try {
      const replies =
        await this._commentReplyRepository.findRepliesByCommentId(commentId);

      return ResponseUtils.format({
        data: replies,
        description: 'All comments replies',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error retrieving replies:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Could not retrieve any replies.',
      });
    }
  }

  async getCriteriaByIndicator(indicatorName: string): Promise<any> {
    try {
      const criteria =
        await this._indicatorRepository.findCriteriaByIndicatorName(
          indicatorName,
        );

      if (!criteria) {
        throw new Error('No evaluation criteria found.');
      }

      return ResponseUtils.format({
        data: criteria,
        description: 'Indicator evaluation criteria',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error retrieving evaluation criteria:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Could not retrieve evaluation criteria.',
      });
    }
  }

  async getAssessorsByEvaluations(evaluationId: number): Promise<any> {
    try {
      const assessedR1 =
        await this._evaluationsRepository.findAssessorsR1(evaluationId);
      const assessedR2 =
        await this._evaluationsRepository.findAssessorsR2(evaluationId);

      const response = {
        assessed_r1: assessedR1[0]?.assessed_r1 || 'Not yet assessed',
        assessed_r2: assessedR2[0]?.assessed_r2 || 'Not yet assessed',
      };

      return {
        data: response,
        message: `Assessors in evaluation ${evaluationId}`,
      };
    } catch (error) {
      this._logger.error('Error retrieving assessors:', error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Could not retrieve assessors.',
      });
    }
  }

  async updateRequireSecondEvaluation(
    evaluationId: number,
    requireSecondAssessment: boolean,
  ): Promise<any> {
    try {
      const evaluation = await this._evaluationsRepository.findOne({
        where: { id: evaluationId },
      });

      if (!evaluation) {
        throw new Error(`Evaluation ${evaluationId} not found.`);
      }

      evaluation.require_second_assessment = requireSecondAssessment;
      await this._evaluationsRepository.save(evaluation);

      return ResponseUtils.format({
        data: evaluation,
        description: `Evaluation ${evaluationId} updated.`,
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(`Error updating evaluation ${evaluationId}:`, error);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: `Error updating evaluation ${evaluationId}.`,
      });
    }
  }

  async pendingHighlights(): Promise<any> {
    try {
      const query = `
      SELECT
          SUM(IF(comments.highlight_comment = 1 AND comments.is_deleted = 0, 1, 0)) AS pending_highlight_comments,
          SUM(IF(comments.tpb = 1 AND comments.is_deleted = 0, 1, 0)) AS total_tpb_comments,
          SUM(IF(comments.require_changes = 1 AND comments.is_deleted = 0, 1, 0)) AS solved_with_require_request,
          SUM(IF(comments.require_changes = 0 AND comments.tpb = 1 AND comments.is_deleted = 0, 1, 0)) AS solved_without_require_request,
          SUM(IF(comments.require_changes = 1 AND comments.ppu = 0 AND comments.is_deleted = 0, 1, 0)) AS pending_tpb_decisions,
          evaluations.indicator_view_name
        FROM
          qa_comments comments
        LEFT JOIN qa_evaluations evaluations ON evaluations.id = comments.evaluationId
        LEFT JOIN qa_comments_replies replies ON replies.commentId = comments.id AND replies.is_deleted = 0
        WHERE
          comments.is_deleted = 0
          AND comments.detail IS NOT NULL
          AND metaId IS NOT NULL
          AND evaluation_status <> 'Deleted'
          AND evaluations.phase_year = actual_phase_year()
          AND evaluations.batchDate >= actual_batch_date()
        GROUP BY
          evaluations.indicator_view_name;
      `;

      const highlights = await this._evaluationsRepository.query(query);

      if (highlights.length === 0) {
        throw new Error('No evaluations found for this user.');
      }

      const data = highlights.map((highlight: any) => ({
        pending_highlight_comments:
          highlight.pending_highlight_comments - highlight.total_tpb_comments,
        solved_with_require_request: highlight.solved_with_require_request,
        solved_without_require_request:
          highlight.solved_without_require_request,
        pending_tpb_decisions: highlight.pending_tpb_decisions,
        indicator_view_name: highlight.indicator_view_name,
      }));

      return ResponseUtils.format({
        data,
        description: 'All highlights status',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error retrieving highlighted status:', error.message);
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Could not retrieve highlighted status.',
      });
    }
  }

  async getEvaluationStatus(resultId: string): Promise<any> {
    try {
      const rawData =
        await this._evaluationsRepository.getEvaluationStatus(resultId);

      const data = rawData.map((item) => ({
        indicator_view_id: item.indicator_view_id,
        evaluations_status: item.evaluations_status,
      }));

      return ResponseUtils.format({
        data,
        description: `Evaluation status for result: ${resultId}`,
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(
        `Error retrieving evaluation status for result: ${resultId}`,
        error.message,
      );
      return ResponseUtils.format({
        data: {},
        errors: error,
        status: HttpStatus.NOT_FOUND,
        description: 'Could not retrieve evaluation status.',
      });
    }
  }
}
