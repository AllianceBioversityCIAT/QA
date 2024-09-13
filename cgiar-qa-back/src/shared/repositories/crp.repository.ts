import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Crp } from '../entities/crp.entity';

@Injectable()
export class CrpRepository extends Repository<Crp> {
  constructor(private datasource: DataSource) {
    super(Crp, datasource.createEntityManager());
  }
}
