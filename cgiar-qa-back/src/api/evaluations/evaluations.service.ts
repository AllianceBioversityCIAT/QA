import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EvaluationRepository } from './repositories/evaluation.repository';
import { UserRepository } from '../users/users.repository';
import { RolesHandler } from '../../shared/enum/roles-handler.enum';
import { StatusHandler } from './enum/status-handler.enum';
import { ResponseUtils } from '../../utils/response.utils';
import { DisplayTypeHandler } from './enum/display-handler.enum';

@Injectable()
export class EvaluationsService {
  private readonly _logger = new Logger(EvaluationsService.name);

  constructor(
    private readonly _evaluationsRepository: EvaluationRepository,
    private readonly _userRepository: UserRepository,
  ) {}

  async getAllEvaluationsDash(crpId: string, userId: number) {
    try {
      if (crpId) {
        return await this._evaluationsRepository.getEvaluationsForCrp(
          crpId,
          userId,
        );
      } else {
        return await this._evaluationsRepository.getEvaluations();
      }
    } catch (error) {
      this._logger.error(`Error fetching evaluations: ${error.message}`);
      throw new Error('Could not access evaluations data.');
    }
  }
}
