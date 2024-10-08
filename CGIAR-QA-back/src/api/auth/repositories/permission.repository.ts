import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionRepository extends Repository<Permission> {
  private readonly _logger = new Logger(PermissionRepository.name);

  constructor(private dataSource: DataSource) {
    super(Permission, dataSource.createEntityManager());
  }
}
