import { Injectable } from '@nestjs/common';
import { DataSource, Not, Repository } from 'typeorm';
import { CommentsReplies } from '../entities/comments-reply.entity';

@Injectable()
export class CommentsRepliesRepository extends Repository<CommentsReplies> {
  constructor(private dataSource: DataSource) {
    super(CommentsReplies, dataSource.createEntityManager());
  }

  async findOneWithComment(id: number): Promise<CommentsReplies | null> {
    return await this.findOne({
      where: { id },
      relations: ['comment'],
    });
  }

  async findRepliesByCommentId(commentId: number): Promise<CommentsReplies[]> {
    return await this.find({
      where: {
        comment: { id: commentId },
        is_deleted: Not(true),
      },
      relations: {
        obj_user: true,
      },
      order: { createdAt: 'ASC' },
    });
  }
}
