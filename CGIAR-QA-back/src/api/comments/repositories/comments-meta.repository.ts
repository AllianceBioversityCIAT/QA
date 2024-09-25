import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CommentsMeta } from '../entities/comments-meta.entity';

@Injectable()
export class CommentsMetaRepository extends Repository<CommentsMeta> {
  constructor(private dataSource: DataSource) {
    super(CommentsMeta, dataSource.createEntityManager());
  }
}
