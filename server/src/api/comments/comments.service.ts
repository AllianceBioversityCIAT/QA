import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ResponseUtils } from '../../utils/response.utils';
import { CommentsRepository } from './repositories/comments.repository';
import { IndicatorsRepository } from '../indicators/repositories/indicators.repository';
import { CommentsMetaRepository } from './repositories/comments-meta.repository';
import { UserRepository } from '../users/users.repository';
import { TagsRepository } from './repositories/tags.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import { EvaluationRepository } from '../evaluations/repositories/evaluation.repository';
import { BatchesRepository } from '../../shared/repositories/batch.repository';
import { QuickCommentsRepository } from './repositories/quick-comments.repository';
import { TokenDto } from '../../shared/global-dto/token.dto';
import { ToggleApprovedNoCommentsDto } from './dto/comment.dto';
import { Comments } from './entities/comments.entity';
import { IsNull, Not } from 'typeorm';

@Injectable()
export class CommentsService {
  private readonly _logger = new Logger(CommentsService.name);

  constructor(
    private readonly _commentsRepository: CommentsRepository,
    private readonly _indicatorsRepository: IndicatorsRepository,
    private readonly _commentsMetaRepository: CommentsMetaRepository,
    private readonly _usersRepository: UserRepository,
    private readonly _tagsRepository: TagsRepository,
    private readonly _cycleRepository: CycleRepository,
    private readonly _evaluationsRepository: EvaluationRepository,
    private readonly _batchesRepository: BatchesRepository,
    private readonly _quickCommentsRepository: QuickCommentsRepository,
  ) {}

  async getCommentsCount(crpId?: string): Promise<any> {
    try {
      let rawData;

      if (!crpId || crpId === 'undefined' || crpId === 'null') {
        rawData = await this._commentsRepository.getAllComments();
      } else {
        rawData = await this._commentsRepository.getCommentsByCrpId(crpId);
      }

      const groupedData = this._evaluationsRepository.groupBy(
        rawData,
        'indicator_view_name',
      );

      return ResponseUtils.format({
        data: groupedData,
        description: 'Comments statistics',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(
        'Error retrieving comments statistics:',
        error.message,
      );

      return ResponseUtils.format({
        data: {},
        description: 'Comments statistics not found.',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async createCommentsMeta() {
    try {
      const indicators = await this._indicatorsRepository
        .createQueryBuilder('qa_indicators')
        .where(
          'qa_indicators.id NOT IN (SELECT indicatorId FROM qa_comments_meta)',
        )
        .getMany();

      const savePromises = indicators.map((indicator) => {
        const newCommentMeta = this._commentsMetaRepository.create({
          enable_assessor: false,
          enable_crp: false,
          indicator: indicator,
        });
        return newCommentMeta;
      });

      const response = await this._commentsMetaRepository.save(savePromises);

      return ResponseUtils.format({
        data: response,
        description: 'Comments meta created successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error creating comments meta:', error);
      return ResponseUtils.format({
        data: {},
        description: 'Failed to create comments meta.',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async getCommentsExcel(evaluationId: string, query: any): Promise<any> {
    const { userId, crp_id, indicatorName } = query;

    try {
      let commentsData;
      if (!evaluationId || evaluationId === 'undefined') {
        this._logger.error('Evaluation ID is required.');
        commentsData = await this._commentsRepository.fetchCommentsByCRP(
          crp_id,
          indicatorName,
        );
      } else {
        this
        commentsData = await this._commentsRepository.fetchCommentsByEvaluation(
          evaluationId,
          indicatorName,
        );
      }

      return ResponseUtils.format({
        data: commentsData,
        description: 'Comments retrieved successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error fetching comments:', error);
      throw ResponseUtils.format({
        data: {},
        description: 'Comments not found.',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async getAllIndicatorTags(crp_id?: string): Promise<any> {
    try {
      let tagsByIndicators: any;
      if (crp_id && crp_id !== 'undefined') {
        tagsByIndicators = await this._tagsRepository.fetchTagsByCRP(crp_id);
      } else {
        tagsByIndicators = await this._tagsRepository.fetchAllTags();
      }
      return ResponseUtils.format({
        data: tagsByIndicators,
        description: 'Tags by indicators retrieved successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error retrieving tags:', error);
      throw ResponseUtils.format({
        data: {},
        description: 'Tags by indicators cannot be retrieved.',
        status: HttpStatus.NOT_FOUND,
        errors: error,
      });
    }
  }

  async getFeedTags(
    indicator_view_name?: string,
    tagTypeId?: string,
  ): Promise<any> {
    try {
      let feedTags;
      if (indicator_view_name !== 'undefined' && tagTypeId !== 'undefined') {
        feedTags =
          await this._tagsRepository.fetchFeedTagsByIndicatorAndTagType(
            indicator_view_name,
            tagTypeId,
          );
      } else if (
        indicator_view_name !== 'undefined' &&
        tagTypeId === 'undefined'
      ) {
        feedTags =
          await this._tagsRepository.fetchFeedTagsByIndicator(
            indicator_view_name,
          );
      } else {
        feedTags = await this._tagsRepository.fetchAllFeedTags();
      }
      return ResponseUtils.format({
        data: feedTags,
        description: 'Feed tags retrieved successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error retrieving feed tags:', error);
      throw ResponseUtils.format({
        data: null,
        errors: 'Feed tags cannot be retrieved.',
        description: 'Feed tags cannot be retrieved.',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async toggleApprovedNoComments(
    evaluationId: number,
    toggleApprovedNoCommentsDto: ToggleApprovedNoCommentsDto,
  ) {
    const { meta_array, userId, noComment } = toggleApprovedNoCommentsDto;
    let comments;
    try {
      const query = `
        SELECT * FROM qa_comments qc
        LEFT JOIN qa_comments_meta qcm ON qc.metaId = qcm.id
        WHERE qc.evaluationId = ? 
          AND qc.metaId IN (?) 
          AND qc.approved_no_comment IS NOT NULL 
          AND qc.is_deleted = 0
          AND qc.is_visible = 1
      `;
      comments = await this._commentsRepository.query(query, [
        evaluationId,
        meta_array,
      ]);

      let user = await this._usersRepository.findOneOrFail({
        where: { id: userId },
      });

      let evaluation = await this._evaluationsRepository.findOne({
        where: { id: evaluationId },
      });

      let current_cycle = await this._cycleRepository
        .createQueryBuilder('qa_cycle')
        .select('*')
        .where('DATE(qa_cycle.start_date) <= CURDATE()')
        .andWhere('DATE(qa_cycle.end_date) > CURDATE()')
        .getRawOne();

      const assessedQuery = `
        SELECT * FROM qa_evaluations_assessed_by_qa_users
        WHERE qaEvaluationsId = ? AND qaUsersId = ?
        `;
      const assessed_by = await this._commentsRepository.query(assessedQuery, [
        evaluationId,
        userId,
      ]);

      if (assessed_by.length <= 0) {
        const insertAssessedBy = await this._commentsRepository
          .createQueryBuilder()
          .insert()
          .into('qa_evaluations_assessed_by_qa_users')
          .values({
            qaEvaluationsId: evaluationId,
            qaUsersId: userId,
          })
          .execute();
      }

      let response = [];
      for (const meta of meta_array) {
        if (comments && comments.find((comment) => comment.metaId == meta)) {
          await this._commentsRepository.update(
            {
              meta: meta,
              evaluation: evaluation.id,
              approved_no_comment: Not(IsNull()),
            },
            {
              approved: noComment,
              approved_no_comment: noComment,
              is_deleted: !noComment ? true : false,
              is_visible: !noComment ? false : true,
              evaluation: evaluation.id,
              userId: user.id,
              detail: null,
              meta: meta,
            },
          );
        } else {
          await this._commentsRepository.save({
            approved: noComment,
            approved_no_comment: noComment,
            is_deleted: noComment ? false : true,
            is_visible: noComment ? true : false,
            evaluation: evaluation.id,
            userId: user.id,
            detail: null,
            meta: meta,
            cycle: current_cycle.id,
          });
        }
      }

      return ResponseUtils.format({
        data: {},
        description: 'Comments toggled successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error toggling approved comments:', error);
      throw ResponseUtils.format({
        data: {},
        description: 'Comments not set as approved.',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async toggleApprovedNoComments2(
    evaluationId: number,
    toggleApprovedNoCommentsDto: ToggleApprovedNoCommentsDto,
  ) {
    const { meta_array, userId, noComment } = toggleApprovedNoCommentsDto;
    try {
      const user = await this._usersRepository.findOneOrFail({
        where: { id: userId },
      });
      const evaluation = await this._evaluationsRepository.findOne({
        where: { id: evaluationId },
      });
      const currentCycle = await this._cycleRepository.getCurrentCycle();

      const existingComments =
        await this._commentsRepository.findCommentsWithMeta(
          evaluationId,
          meta_array,
        );

      const response = [];

      for (const metaId of meta_array) {
        let comment = existingComments.find(
          (comment) => comment.meta === metaId,
        );

        if (comment) {
          comment.approved = noComment;
          comment.is_deleted = !noComment;
          comment.approved_no_comment = noComment;
          comment.detail = null;
          comment.userId = user.id;
        } else {
          comment = this._commentsRepository.createComment(
            user,
            evaluation,
            metaId,
            noComment,
            currentCycle,
          );
        }
        response.push(comment);
      }

      const result = await this._commentsRepository.save(response);

      return ResponseUtils.format({
        data: result,
        description: 'Comments toggled successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error toggling approved comments:', error);
      throw ResponseUtils.format({
        data: {},
        description: 'Comments not set as approved.',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async getRawCommentsExcel(crp_id: string) {
    try {
      const data = await this._commentsRepository.getRawCommentsExcel(crp_id);

      return ResponseUtils.format({
        data: data,
        description: 'Raw comments excel data retrieved successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error fetching raw comments excel data:', error);
      return ResponseUtils.format({
        data: {},
        description: 'Could not retrieve raw comments excel data',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async getRawCommentsData(crp_id?: string): Promise<any> {
    try {
      const rawData = await this._commentsRepository.getRawCommentsData(crp_id);
      return ResponseUtils.format({
        data: rawData,
        description: 'Comments raw data',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error fetching raw comments data:', error);
      return ResponseUtils.format({
        data: {},
        description: 'Comments raw data error',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async getCycles() {
    try {
      const cycles = await this._cycleRepository.getAllCycles();
      return ResponseUtils.format({
        data: cycles,
        description: 'Cycles data retrieved successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      throw ResponseUtils.format({
        description: 'Could not retrieve cycles',
        status: HttpStatus.NOT_FOUND,
        data: error.message,
      });
    }
  }

  async getActualCycle() {
    try {
      const cycles = await this._cycleRepository.getActualCycle();
      return ResponseUtils.format({
        data: cycles,
        description: 'Cycles data retrieved successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      throw ResponseUtils.format({
        description: 'Could not retrieve cycles',
        status: HttpStatus.NOT_FOUND,
        data: error.message,
      });
    }
  }

  async updateCycle(id: number, start_date: Date, end_date: Date) {
    try {
      const cycle = await this._cycleRepository.findCycleById(id);
      if (!cycle) {
        throw ResponseUtils.format({
          description: `Cycle with id ${id} not found`,
          status: HttpStatus.NOT_FOUND,
        });
      }

      cycle.start_date = start_date;
      cycle.end_date = end_date;

      const updatedCycle = await this._cycleRepository.updateCycle(cycle);
      return ResponseUtils.format({
        data: updatedCycle,
        description: 'Cycle updated successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      throw ResponseUtils.format({
        description: 'Could not update cycle',
        status: HttpStatus.NOT_FOUND,
        data: error.message,
      });
    }
  }

  async patchPpuChanges(ppu: number, commentReplyId: number) {
    try {
      const comment =
        await this._commentsRepository.findCommentById(commentReplyId);
      comment.ppu = ppu;

      const updatedComment =
        await this._commentsRepository.saveComment(comment);
      const message =
        ppu !== 0
          ? 'Require changes was marked done'
          : 'Require changes was removed';

      return ResponseUtils.format({
        data: updatedComment,
        description: message,
        status: HttpStatus.ACCEPTED,
      });
    } catch (error) {
      throw ResponseUtils.format({
        description: 'An error occurred when trying to mark require changes',
        status: HttpStatus.BAD_REQUEST,
        data: error.message,
      });
    }
  }

  async getBatches() {
    try {
      const rawData = await this._batchesRepository.findBatchesOrderedByName();

      return ResponseUtils.format({
        data: rawData,
        description: 'Batches data retrieved successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return ResponseUtils.format({
        data: null,
        description: 'Could not retrieve batches data',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async getQuickComments() {
    try {
      const quickComments = await this._quickCommentsRepository.find();

      return ResponseUtils.format({
        data: quickComments,
        description: 'Quick comments retrieved successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return ResponseUtils.format({
        data: null,
        description: 'Could not retrieve quick comments',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async getExcelComments(crp_id: string) {
    try {
      const data = await this._commentsRepository.getExcelComments(crp_id);
      return ResponseUtils.format({
        data,
        description: 'Excel comments retrieved successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error fetching excel comments:', error);
      return ResponseUtils.format({
        data: {},
        description: 'Could not retrieve excel comments',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }
}
