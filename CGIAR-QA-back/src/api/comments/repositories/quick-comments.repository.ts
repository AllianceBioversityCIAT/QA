import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { QuickComments } from '../entities/quick-comments.entity';

@Injectable()
export class QuickCommentsRepository extends Repository<QuickComments> {
  constructor(private readonly dataSource: DataSource) {
    super(QuickComments, dataSource.createEntityManager());
  }
}
