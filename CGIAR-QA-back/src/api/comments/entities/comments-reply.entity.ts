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

  @ManyToOne(() => Comments, (comment) => comment.replies)
  comment: Comments;

  @Column({
    name: 'user',
    type: 'int',
  })
  user: number;

  @ManyToOne(() => Users, (user) => user.replies)
  @JoinColumn({ name: 'user' })
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
