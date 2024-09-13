import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { datasource } from '../../config/orm.config';
import { Cycle } from '../entities/cycle.entity';

@Injectable()
export class CycleRepository extends Repository<Cycle> {
  constructor(private datasource: DataSource) {
    super(Cycle, datasource.createEntityManager());
  }
}
