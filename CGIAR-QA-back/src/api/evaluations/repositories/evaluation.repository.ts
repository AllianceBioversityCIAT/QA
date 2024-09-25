import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Evaluations } from '../entities/evaluation.entity';

@Injectable()
export class EvaluationRepository extends Repository<Evaluations> {
  constructor(private readonly dataSource: DataSource) {
    super(Evaluations, dataSource.createEntityManager());
  }
}
