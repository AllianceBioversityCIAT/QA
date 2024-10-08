import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CommentsReplies } from '../entities/comments-reply.entity';

@Injectable()
export class CommentsRepliesRepository extends Repository<CommentsReplies> {
  constructor(private dataSource: DataSource) {
    super(CommentsReplies, dataSource.createEntityManager());
  }
}
