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

  async commentsCount(crpId: string, userId: number) {
    try {
      const commentsStatistics =
        await this._commentsRepository.getCommentsCount(crpId, userId);
      return ResponseUtils.format({
        data: commentsStatistics,
        description: 'Comments statistics',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Could not access comments statistics.',
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
      const user = await this._usersRepository.findOneOrFail({
        where: { id: userId },
        relations: ['roles'],
      });

      const currentRole = user.roles[0]?.role.description;

      let commentsData;
      if (!evaluationId || evaluationId === 'undefined') {
        commentsData = await this._commentsRepository.fetchCommentsByCRP(
          crp_id,
          indicatorName,
        );
      } else {
        commentsData = await this._commentsRepository.fetchCommentsByEvaluation(
          evaluationId,
          currentRole,
          indicatorName,
        );
      }

      return commentsData;
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
      return tagsByIndicators;
    } catch (error) {
      this._logger.error('Error retrieving tags:', error);
      throw ResponseUtils.format({
        data: {},
        description: 'Tags by indicators cannot be retrieved.',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async getFeedTags(
    indicator_view_name?: string,
    tagTypeId?: string,
  ): Promise<any> {
    try {
      let feedTags;
      if (indicator_view_name && tagTypeId) {
        feedTags =
          await this._tagsRepository.fetchFeedTagsByIndicatorAndTagType(
            indicator_view_name,
            tagTypeId,
          );
      } else if (indicator_view_name) {
        feedTags =
          await this._tagsRepository.fetchFeedTagsByIndicator(
            indicator_view_name,
          );
      } else {
        feedTags = await this._tagsRepository.fetchAllFeedTags();
      }
      return feedTags;
    } catch (error) {
      this._logger.error('Error retrieving feed tags:', error);
      throw ResponseUtils.format({
        data: {},
        description: 'Feed tags cannot be retrieved.',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async toggleApprovedNoComments(
    evaluationId: number,
    meta_array: number[],
    userId: number,
    noComment: boolean,
  ) {
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
          (comment) => comment.meta.id === metaId,
        );

        if (comment) {
          comment.approved = noComment;
          comment.is_deleted = !noComment;
          comment.approved_no_comment = noComment;
          comment.detail = null;
          comment.user = user.id;
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
    return await this._commentsRepository.getRawCommentsExcel(crp_id);
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
