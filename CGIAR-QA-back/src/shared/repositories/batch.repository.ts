import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Batch } from '../entities/batch.entity';

@Injectable()
export class BatchesRepository extends Repository<Batch> {
  constructor(private readonly dataSource: DataSource) {
    super(Batch, dataSource.createEntityManager());
  }
}
