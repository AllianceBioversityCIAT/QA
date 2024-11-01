import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, In, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { RoleRepository } from '../roles/repositories/role.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { GeneralConfigurationRepository } from '../../shared/repositories/general-config.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import * as jwt from 'jsonwebtoken';
import config from '../../config/const.config';
import { UserRole } from './entities/user-role.entity';
import { UserRoleRepository } from './user-role.repository';

@Injectable()
export class UserRepository extends Repository<Users> {
  private readonly _logger = new Logger(UserRepository.name);

  constructor(
    private datasource: DataSource,
    private _crpRepository: CrpRepository,
    private _roleRepository: RoleRepository,
    private _generalConfigRepository: GeneralConfigurationRepository,
    private _cycleRepository: CycleRepository,
    private readonly _userRoleRepository: UserRoleRepository,
  ) {
    super(Users, datasource.createEntityManager());
  }

  async createOrReturnUser(authToken: any): Promise<any> {
    let user = await this.findOne({
      where: { email: authToken.email },
      relations: {
        roles: {
          role: true,
        },
        crps: true,
        crp: true,
      },
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
    console.log('🚀 ~ UserRepository ~ createOrReturnUser ~ crpRole:', crpRole);

    if (!crpRole) {
      throw new NotFoundException('CRP Role not found');
    }

    if (!user) {
      user = new Users();
      user.email = authToken.email;
      user.username = authToken.username;
      user.name = authToken.name;
      user.password = '';
      user.is_marlo = true;
      user.crp = crp;
      user.crps = [crp];
      user = await this.save(user);

      await this._userRoleRepository.save({
        qa_user: user.id,
        qa_role: crpRole.id,
      });
    }

    const userCrpQuery = `
      SELECT
        *
      FROM
        qa_user_crps
      WHERE
        qa_crp = ?
        AND qa_user = ?
    `;
    const userCrpExists = await this.query(userCrpQuery, [crp.id, user.id]);

    if (user && userCrpExists === 0) {
      user.crps.push(crp);
      user = await this.save(user);

      await this._userRoleRepository.save({
        qa_user: user.id,
        qa_role: crpRole.id,
      });
    }

    const [generalConfig, currentCycle] = await Promise.all([
      this._generalConfigRepository.find({
        where: {
          roleId: In(user.roles.map((userRole) => userRole.role.id)),
          start_date: LessThanOrEqual(new Date()),
          end_date: MoreThan(new Date()),
        },
      }),

      this._cycleRepository.find({
        where: {
          start_date: LessThanOrEqual(new Date()),
          end_date: MoreThan(new Date()),
        },
      }),
    ]);

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: config.jwtTime },
    );

    const formattedUser = {
      ...user,
      roles: user.roles.map((userRole) => ({
        id: userRole.role.id,
        description: userRole.role.description,
        createdAt: userRole.role.createdAt,
        updatedAt: userRole.role.updatedAt,
        acronym: userRole.role.acronym,
        is_active: userRole.role.is_active,
        permissions: userRole.role.permissions,
      })),
      token,
      config: generalConfig,
      cycle: currentCycle,
    };

    return formattedUser;
  }
}
