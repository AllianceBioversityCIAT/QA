import { Module } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationRepository } from './repositories/evaluation.repository';
import { UserRepository } from '../users/users.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { GeneralConfigurationRepository } from '../../shared/repositories/general-config.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [EvaluationsController],
  providers: [
    EvaluationsService,
    EvaluationRepository,
    UserRepository,
    CrpRepository,
    RoleRepository,
    GeneralConfigurationRepository,
    CycleRepository,
    JwtService,
  ],
})
export class EvaluationsModule {}
