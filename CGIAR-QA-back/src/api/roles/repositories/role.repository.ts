import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private datasource: DataSource) {
    super(Role, datasource.createEntityManager());
  }
}
