import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Comments } from './comments.entity';
import { Users } from '../../users/entities/user.entity';

@Entity('qa_comments_replies')
export class CommentsReplies {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'commentId',
    type: 'int',
  })
  comment: number;

  @ManyToOne(() => Comments, (comment) => comment.obj_replies)
  @JoinColumn({ name: 'commentId' })
  obj_comment: Comments;

  @Column({
    name: 'userId',
    type: 'int',
  })
  user: number;

  @ManyToOne(() => Users, (user) => user.obj_replies)
  @JoinColumn({ name: 'userId' })
  obj_user: Users;

  @Column({
    default: false,
  })
  is_deleted: boolean;

  @Column({ type: 'longtext' })
  detail: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
