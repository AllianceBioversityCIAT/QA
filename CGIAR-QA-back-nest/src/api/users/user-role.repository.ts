import { Injectable, Logger } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class UserRoleRepository extends Repository<UserRole> {
  private readonly _logger = new Logger(UserRoleRepository.name);

  constructor(private datasource: DataSource) {
    super(UserRole, datasource.createEntityManager());
  }
}
