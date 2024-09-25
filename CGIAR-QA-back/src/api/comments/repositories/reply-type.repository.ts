import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ReplyType } from '../entities/reply-type.entity';

@Injectable()
export class ReplyTypeRepository extends Repository<ReplyType> {
  constructor(private dataSource: DataSource) {
    super(ReplyType, dataSource.createEntityManager());
  }
}
