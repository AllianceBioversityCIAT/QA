import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  AssignIndicatorDto,
  CreateIndicatorDto,
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

@Injectable()
export class IndicatorsService {
  private readonly _logger = new Logger(IndicatorsService.name);

  constructor(
    private readonly _indicatorsRepository: IndicatorsRepository,
    private readonly _usersRepository: UserRepository,
    private readonly _indicatorUserRepository: IndicatorUsersRepository,
    private readonly _evaluationsRepository: EvaluationRepository,
    private readonly _crpRepository: CrpRepository,
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
        return {
          message: 'Indicator by user saved',
          data: savedIndicators,
        };
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
          return {
            message: 'Indicator already assigned to user',
            data: selectedIndicator,
          };
        }
      } catch (error) {
        this._logger.error(error);
        return ResponseUtils.format({
          data: {},
          description: 'Users or indicator not found',
          status: HttpStatus.NOT_FOUND,
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

      return {
        message: 'All indicators retrieved successfully',
        data: indicators,
      };
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Error retrieving indicators',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async update(id: number, updateIndicatorDto: UpdateIndicatorDto) {
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

    if (!indicator.name || !indicator.description || !indicator.view_name) {
      return ResponseUtils.format({
        data: {},
        description:
          'Validation errors: name, description, and view_name are required',
        status: HttpStatus.BAD_REQUEST,
      });
    }

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
      const user: Users = await this._usersRepository.findOneOrFail({
        where: { id: userId },
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

  async getItemStatusByIndicator(indicator: string, crpId?: string) {
    try {
      const totalEvaluationsByIndicator =
        await this._indicatorsRepository.getItemStatusByIndicator(
          indicator,
          crpId,
        );

      return ResponseUtils.format({
        data: totalEvaluationsByIndicator,
        description: 'Items by indicator retrieved successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: {},
        description: 'Item status by indicators cannot be retrieved',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
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
}
