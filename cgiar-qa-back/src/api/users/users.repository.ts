import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RoleRepository } from '../roles/repositories/role.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { GeneralConfigurationRepository } from '../../shared/repositories/general-config.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import * as jwt from 'jsonwebtoken';
import config from '../../config/const.config';

@Injectable()
export class UserRepository extends Repository<User> {
  private readonly _logger = new Logger(UserRepository.name);

  constructor(
    private datasource: DataSource,
    private _crpRepository: CrpRepository,
    private _roleRepository: RoleRepository,
    private _generalConfigRepository: GeneralConfigurationRepository,
    private _cycleRepository: CycleRepository,
  ) {
    super(User, datasource.createEntityManager());
  }

  async createOrReturnUser(authToken: any): Promise<User> {
    let user = await this.findOne({
      where: { email: authToken.email },
      relations: ['crps', 'roles'],
    });

    const crp = await this._crpRepository.findOne({
      where: { crp_id: authToken.crp_id },
    });

    if (!crp) {
      throw new NotFoundException('CRP not found');
    }

    const crpRole = await this._roleRepository.findOne({
      where: { description: 'CRP' },
    });

    if (!crpRole) {
      throw new NotFoundException('CRP Role not found');
    }

    if (!user) {
      user = new User();
      user.email = authToken.email;
      user.username = authToken.username;
      user.name = authToken.name;
      user.password = '';
      user.is_marlo = true;
      // user.userRoles = [crpRole];
      // user.crps = [crp];
      user = await this.save(user);
    }

    const userCrpExists = await this.createQueryBuilder('user_crps')
      .where('user_crps.crp_id = :crpId', { crpId: authToken.qa_crp_id })
      .andWhere('user_crps.user_id = :userId', { userId: user.id })
      .getCount();

    if (user && userCrpExists === 0) {
      // user.crps.push(crp);
      // user.userRoles.push(crpRole);
      user = await this.save(user);
    }

    const generalConfig = await this._generalConfigRepository
      .createQueryBuilder('general_config')
      .where(`general_config.roleId IN (:...roleIds)`, {
        // roleIds: user.roles.map((role) => role.),
      })
      .andWhere('DATE(general_config.start_date) <= CURDATE()')
      .andWhere('DATE(general_config.end_date) > CURDATE()')
      .getRawMany();

    const currentCycle = await this._cycleRepository
      .createQueryBuilder('cycle')
      .where('DATE(cycle.start_date) <= CURDATE()')
      .andWhere('DATE(cycle.end_date) > CURDATE()')
      .getRawOne();

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: config.jwtTime },
    );

    user['token'] = token;
    user['config'] = generalConfig;
    user['cycle'] = currentCycle;

    delete user.password;
    // delete user.replies;

    return user;
  }
}
