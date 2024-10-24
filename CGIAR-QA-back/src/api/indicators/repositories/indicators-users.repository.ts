import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { IndicatorUser } from '../entities/indicators-user.entity';

@Injectable()
export class IndicatorUsersRepository extends Repository<IndicatorUser> {
  constructor(private readonly dataSource: DataSource) {
    super(IndicatorUser, dataSource.createEntityManager());
  }
}
