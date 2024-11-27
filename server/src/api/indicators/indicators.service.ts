import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import {
  AssignIndicatorDto,
  CreateIndicatorDto,
  IndicatorEnableDto,
  UpdateIndicatorDto,
} from './dto/indicator.dto';
import { Indicators } from './entities/indicators.entity';
import { ResponseUtils } from '../../utils/response.utils';
import { IndicatorsRepository } from './repositories/indicators.repository';
import { UserRepository } from '../users/users.repository';
import { IndicatorUsersRepository } from './repositories/indicators-users.repository';
import { EvaluationRepository } from '../evaluations/repositories/evaluation.repository';
import { Users } from '../users/entities/user.entity';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { CommentsMetaRepository } from '../comments/repositories/comments-meta.repository';

@Injectable()
export class IndicatorsService {
  private readonly _logger = new Logger(IndicatorsService.name);

  constructor(
    private readonly _indicatorsRepository: IndicatorsRepository,
    private readonly _usersRepository: UserRepository,
    private readonly _indicatorUserRepository: IndicatorUsersRepository,
    private readonly _evaluationsRepository: EvaluationRepository,
    private readonly _crpRepository: CrpRepository,
    private readonly _commentsMetaRepository: CommentsMetaRepository,
  ) {}

  async create(createIndicatorDto: CreateIndicatorDto) {
    const { name, description, view_name, primary_field } = createIndicatorDto;

    const indicator = new Indicators();
    indicator.name = name;
    indicator.description = description;
    indicator.view_name = view_name;
    indicator.primary_field = primary_field;

    try {
      const savedIndicator = await this._indicatorsRepository.save(indicator);

      if (primary_field && primary_field.trim() !== '') {
        const indicatorMeta =
          await this._indicatorsRepository.createMetaForIndicator(
            savedIndicator,
            primary_field,
          );

        return ResponseUtils.format({
          data: { indicator: savedIndicator, meta: indicatorMeta },
          description: 'Indicator created successfully.',
          status: HttpStatus.OK,
        });
      }
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Error creating indicator.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async assignIndicatorToUser(assignIndicatorDto: AssignIndicatorDto) {
    const { user_id, indicator_id, crpId } = assignIndicatorDto;

    let selectedUser: Users;
    let selectedIndicator: Indicators;
    let hasAssignedIndicators = null;

    if (crpId && !indicator_id) {
      try {
        selectedUser = await this._usersRepository.findOneOrFail({
          where: { id: user_id },
        });

        hasAssignedIndicators = await this._evaluationsRepository
          .createQueryBuilder('qa_evaluations')
          .select('indicators.id AS indicatorId')
          .leftJoin(
            'qa_indicators',
            'indicators',
            'indicators.view_name = qa_evaluations.indicator_view_name',
          )
          .groupBy('indicator_view_name')
          .getRawMany();

        const savePromises = hasAssignedIndicators.map((element) => {
          const userbyIndicator = this._indicatorUserRepository.create({
            user: selectedUser,
            indicator: element.indicatorId,
          });
          return userbyIndicator;
        });

        const savedIndicators =
          await this._indicatorUserRepository.save(savePromises);

        return ResponseUtils.format({
          data: savedIndicators,
          description: 'Indicators assigned successfully',
          status: HttpStatus.OK,
        });
      } catch (error) {
        this._logger.error(error);
        return ResponseUtils.format({
          data: {},
          description: 'Users not found',
          status: HttpStatus.NOT_FOUND,
        });
      }
    } else {
      try {
        selectedUser = await this._usersRepository.findOneOrFail({
          where: { id: user_id },
        });
        selectedIndicator = await this._indicatorsRepository.findOneOrFail({
          where: { id: indicator_id },
        });

        hasAssignedIndicators = await this._indicatorUserRepository
          .createQueryBuilder('qa_indicator_user')
          .where('qa_indicator_user.userId = :userId', { userId: user_id })
          .andWhere('qa_indicator_user.indicatorId = :indicatorId', {
            indicatorId: indicator_id,
          })
          .getMany();

        if (hasAssignedIndicators.length > 0) {
          return ResponseUtils.format({
            data: selectedIndicator,
            description: 'Indicator already assigned',
            status: HttpStatus.CONFLICT,
          });
        }
      } catch (error) {
        this._logger.error(error);
        return ResponseUtils.format({
          data: {},
          description: 'Users or indicator not found',
          status: HttpStatus.NOT_FOUND,
          errors: error,
        });
      }

      const userbyIndicator = this._indicatorUserRepository.create({
        user: selectedUser,
        indicator: selectedIndicator,
      });

      return this._indicatorUserRepository.save(userbyIndicator);
    }
  }

  async findAll() {
    try {
      const indicators = await this._indicatorsRepository.find({
        select: {
          id: true,
          name: true,
          description: true,
          view_name: true,
          primary_field: true,
        },
        where: { is_active: true },
      });

      if (!indicators || indicators.length === 0) {
        this._logger.error('No indicators found');
        return ResponseUtils.format({
          data: {},
          description: 'No indicators found',
          status: HttpStatus.NOT_FOUND,
        });
      }

      return ResponseUtils.format({
        data: indicators,
        description: 'Indicators retrieved successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Error retrieving indicators',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async editIndicators(id: number, indicatorEnableDto: IndicatorEnableDto) {
    const { enable, isActive } = indicatorEnableDto;

    try {
      const updateFields =
        enable === 'enable_assessor'
          ? {
              enable_assessor: isActive ? true : false,
              enable_crp: isActive ? false : true,
            }
          : {
              enable_assessor: isActive ? false : true,
              enable_crp: isActive ? true : false,
            };
      await this._commentsMetaRepository.update({ id }, updateFields);

      const indicator = await this._indicatorsRepository.findOneOrFail({
        where: { id },
      });
      return ResponseUtils.format({
        data: indicator,
        description: 'Indicator updated successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Indicator already in use',
        status: HttpStatus.CONFLICT,
      });
    }
  }

  async editIndicators1(id: number, updateIndicatorDto: UpdateIndicatorDto) {
    const { name, description, view_name, primary_field } = updateIndicatorDto;

    let indicator: Indicators;
    try {
      indicator = await this._indicatorsRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Indicator not found',
        status: HttpStatus.NOT_FOUND,
      });
    }

    indicator.name = name;
    indicator.description = description;
    indicator.view_name = view_name;

    if (primary_field && primary_field.trim() !== '') {
      await this._indicatorsRepository.createMetaForIndicator(
        indicator,
        primary_field,
      );
    }

    // if (!indicator.name || !indicator.description || !indicator.view_name) {
    //   return ResponseUtils.format({
    //     data: {},
    //     description:
    //       'Validation errors: name, description, and view_name are required',
    //     status: HttpStatus.BAD_REQUEST,
    //   });
    // }

    try {
      await this._indicatorsRepository.save(indicator);
      return ResponseUtils.format({
        data: indicator,
        description: 'Indicator updated successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Indicator already in use',
        status: HttpStatus.CONFLICT,
      });
    }
  }

  async remove(id: number) {
    try {
      let indicator: Indicators;
      indicator = await this._indicatorsRepository.findOneOrFail({
        where: { id },
      });

      if (!indicator) {
        this._logger.error('Indicator not found');
        return ResponseUtils.format({
          data: {},
          description: 'Indicator not found',
          status: HttpStatus.NOT_FOUND,
        });
      }

      await this._indicatorsRepository.delete(id);
      return ResponseUtils.format({
        data: {},
        description: 'Indicator deleted successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Error deleting indicator',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getIndicatorsByUser(userId: number, crpId?: string) {
    let response = [];
    try {
      const user: Users = await this._usersRepository.findOne({
        where: { id: userId },
        relations: {
          roles: {
            role: true,
          },
        },
      });
      const isAdmin = user.roles.some(
        (userRole) => userRole.role.description === 'ADMIN',
      );

      const isCRP = user.crps.length > 0;

      let indicators;

      if (isAdmin) {
        indicators = await this._indicatorsRepository.getAdminIndicators();
        response = indicators.map((indicator) => ({ indicator }));
      } else if (isCRP) {
        indicators = await this._indicatorsRepository.getCRPIndicators(crpId);
        response = indicators;
      } else {
        indicators = await this._indicatorsRepository.getUserIndicators(userId);
        response = indicators.map((indicator) => ({ indicator }));
      }

      return ResponseUtils.format({
        data: response,
        description: 'Users indicators retrieved successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: [],
        description: 'Error retrieving user indicators',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getItemStatusByIndicator(
    res: Response,
    indicator: string,
    crp_id?: string,
  ) {
    let totalEvaluationsByIndicator = {
      qa_impact_contribution: {},
      qa_other_outcome: {},
      qa_other_output: {},
      qa_capdev: {},
      qa_knowledge_product: {},
      qa_innovation_development: {},
      qa_policy_change: {},
      qa_innovation_use: {},
      qa_innovation_use_ipsr: {},
    };

    try {
      let queryMetas = '';
      if (crp_id != undefined && crp_id != 'undefined') {
        queryMetas = `SELECT col_name, display_name, indicatorId, qi.view_name,
                    (SELECT count(*) FROM qa_evaluations qe WHERE qe.indicator_view_name = qi.view_name AND qe.phase_year = actual_phase_year() AND qe.status <> 'autochecked' AND qe.crp_id = '${crp_id}') AS total
                   FROM qa_indicators_meta qim
                   LEFT JOIN qa_indicators qi ON qi.id = qim.indicatorId
                   WHERE qim.display_name  not like 'id'
                   AND qim.enable_comments <> 0
                   AND qim.include_detail = 1
                   AND qi.view_name like ?`;
      } else {
        queryMetas = `SELECT col_name, display_name, indicatorId, qi.view_name,
                    (SELECT count(*) FROM qa_evaluations qe WHERE qe.indicator_view_name = qi.view_name AND qe.phase_year = actual_phase_year() AND qe.status <> 'autochecked') AS total
                   FROM qa_indicators_meta qim
                   LEFT JOIN qa_indicators qi ON qi.id = qim.indicatorId
                   WHERE qim.display_name  not like 'id'
                   AND qim.enable_comments <> 0
                   AND qim.include_detail = 1
                   AND qi.view_name like ?`;
      }

      let allMetas = await this._indicatorsRepository.query(queryMetas, [
        indicator,
      ]);

      for (const meta of allMetas) {
        let queryNotApplicable = `SELECT count(*) as count FROM qa_evaluations qe
                    LEFT JOIN ${meta.view_name} qi on qe.indicator_view_id = qi.id AND qe.indicator_view_name = "${meta.view_name}"
                    WHERE qi.${meta.col_name}  = "<Not applicable>" AND qe.phase_year = actual_phase_year() AND qe.status <> "autochecked" `;

        if (crp_id != undefined && crp_id != 'undefined') {
          queryNotApplicable += `AND qe.crp_id = '${crp_id}'`;
        }

        totalEvaluationsByIndicator[meta.view_name][meta.display_name] = {
          item: meta.display_name,
          pending: meta.total,
          approved_without_comment: 0,
          assessment_with_comments: 0,
          notApplicable: null,
          queryNotApplicable: queryNotApplicable,
        };

        try {
          let notApplicableCount = await this._indicatorsRepository.query(
            totalEvaluationsByIndicator[meta.view_name][meta.display_name][
              'queryNotApplicable'
            ],
            [],
          );
          totalEvaluationsByIndicator[meta.view_name][meta.display_name][
            'notApplicable'
          ] = +notApplicableCount[0].count;

          totalEvaluationsByIndicator[meta.view_name][meta.display_name][
            'pending'
          ] -= +notApplicableCount[0].count;
        } catch (error) {
          this._logger.error(error);
          return ResponseUtils.format({
            data: [],
            description: 'Error retrieving item status',
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            errors: error,
          });
        }
      }

      return res.status(HttpStatus.OK).json(totalEvaluationsByIndicator);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        message: 'All items status by indicators can not be retrived.',
        data: error,
      });
    }

    try {
      let queryAssessmentByField = '';
      if (crp_id != undefined && crp_id != 'undefined') {
        queryAssessmentByField = `SELECT display_name, col_name, approved_no_comment, indicator_view_name,
                SUM(
                   IF (approved_no_comment = 0, 1, 0)
                   ) AS pending,
               SUM(
                   IF (approved_no_comment = 1, 1, 0)
                   ) AS approved_without_comment,
               SUM(
                   IF (approved_no_comment is null, 1, 0)
                   ) AS assessment_with_comments,
                   count(distinct qe.id) as comments_distribution
               FROM qa_indicators_meta qim
               LEFT JOIN qa_comments qc ON qc.metaId = qim.id
               LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
               WHERE qim.id = qc.metaId
               AND qim.display_name  not like 'id'
               AND qim.enable_comments = 1
               AND qim.include_detail = 1
               AND qe.evaluation_status not like 'Removed'
               AND qe.phase_year = actual_phase_year()
               AND qe.indicator_view_name like :indicator
               AND qc.is_deleted = 0
               AND enable_comments <> 0
               AND qe.crp_id = :crp_id
               GROUP BY display_name, col_name, approved_no_comment, indicator_view_name, approved_no_comment;`;
      } else {
        queryAssessmentByField = `SELECT display_name, col_name, approved_no_comment, indicator_view_name,
                SUM(
                   IF (approved_no_comment = 0, 1, 0)
                   ) AS pending,
               SUM(
                   IF (approved_no_comment = 1, 1, 0)
                   ) AS approved_without_comment,
               SUM(
                   IF (approved_no_comment is null, 1, 0)
                   ) AS assessment_with_comments,
                   count(distinct qe.id) as comments_distribution
               FROM qa_indicators_meta qim
               LEFT JOIN qa_comments qc ON qc.metaId = qim.id
               LEFT JOIN qa_evaluations qe ON qe.id = qc.evaluationId
               WHERE qim.id = qc.metaId
               AND qim.display_name  not like 'id'
               AND qim.enable_comments = 1
               AND qim.include_detail = 1
               AND qe.evaluation_status not like 'Removed'
               AND qe.phase_year = actual_phase_year()
               AND qe.indicator_view_name like :indicator
               AND qc.is_deleted = 0
               AND enable_comments <> 0
               GROUP BY display_name, col_name, approved_no_comment, indicator_view_name, approved_no_comment;`;
      }
      let allItems = await this._indicatorsRepository.query(
        queryAssessmentByField,
        [indicator, crp_id],
      );
      for (let i = 0; i < allItems.length; i++) {
        switch (allItems[i].approved_no_comment) {
          case 1:
            totalEvaluationsByIndicator[allItems[i].indicator_view_name][
              allItems[i].display_name
            ]['approved_without_comment'] =
              +allItems[i].approved_without_comment;
            totalEvaluationsByIndicator[allItems[i].indicator_view_name][
              allItems[i].display_name
            ]['pending'] -= +allItems[i].approved_without_comment;
            break;
          case null:
            totalEvaluationsByIndicator[allItems[i].indicator_view_name][
              allItems[i].display_name
            ]['assessment_with_comments'] =
              +allItems[i].assessment_with_comments;
            totalEvaluationsByIndicator[allItems[i].indicator_view_name][
              allItems[i].display_name
            ]['pending'] -= +allItems[i].comments_distribution;
            break;
          default:
            break;
        }
      }
      totalEvaluationsByIndicator[indicator] = Object.values(
        totalEvaluationsByIndicator[indicator],
      );
      return ResponseUtils.format({
        data: totalEvaluationsByIndicator,
        description: 'Item status by indicators retrieved successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: [],
        description: 'Error retrieving item status',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: error,
      });
    }
  }

  async getAllItemStatuses() {
    try {
      const totalEvaluationsByIndicator =
        await this._indicatorsRepository.getAllItemStatusByIndicator();

      return ResponseUtils.format({
        data: totalEvaluationsByIndicator,
        description: 'All items by indicator retrieved successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Items by indicators cannot be retrieved',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getItemListStatusMIS(id: number, crpId: string, AR: number) {
    try {
      // Llamamos al repositorio para obtener los datos
      const data = await this._indicatorsRepository.getItemListStatusMIS(
        id,
        crpId,
        AR,
      );

      return ResponseUtils.format({
        data,
        description: `List of items for indicator with ID ${id}`,
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Items for MIS cannot be retrieved',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async getItemStatusMIS(
    id: number,
    crpId: string,
    itemId: string,
    AR: number,
  ) {
    try {
      const data = await this._indicatorsRepository.getItemStatusMIS(
        id,
        crpId,
        itemId,
        AR,
      );

      return ResponseUtils.format({
        data,
        description: `Item ${data.id} of ${data.indicator_name} indicator.`,
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Items for MIS cannot be retrieved',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async getCRP(crpId: string) {
    try {
      const crp = await this._crpRepository.findOne({
        where: { crp_id: crpId },
      });

      return ResponseUtils.format({
        data: crp,
        description: `CRP ${crp.id} - ${crp.acronym} loaded.`,
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Could not access CRP data',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async getActionAreas() {
    try {
      const actionAreas = await this._indicatorsRepository.getActionAreas();

      return ResponseUtils.format({
        data: actionAreas,
        description: 'Action areas retrieved successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Error retrieving action areas',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
