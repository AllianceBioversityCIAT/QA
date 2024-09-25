import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Evaluations } from '../../evaluations/entities/evaluation.entity';
import { IndicatorsMeta } from '../../indicators/entities/indicators-meta.entity';
import { Users } from '../../users/entities/user.entity';
import { Cycle } from '../../../shared/entities/cycle.entity';
import { ReplyType } from './reply-type.entity';
import { CommentsReplies } from './comments-reply.entity';
import { Tags } from './tags.entity';

@Entity('qa_comments')
export class Comments {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Evaluations, (evaluation) => evaluation.comments)
  evaluation: Evaluations;

  @ManyToOne(() => IndicatorsMeta, (meta) => meta.comments, { nullable: true })
  meta: IndicatorsMeta;

  @ManyToOne(() => Users, (user) => user.comments)
  user: Users;

  @ManyToOne(() => Cycle, (cycle) => cycle.comments)
  cycle: Cycle;

  @ManyToOne(() => ReplyType, (replyType) => replyType.comments)
  replyType: ReplyType;

  @OneToMany(() => CommentsReplies, (comment) => comment.user)
  replies: CommentsReplies[];

  @OneToMany(() => Tags, (tag) => tag.comment)
  tags: Tags[];

  @Column({ nullable: true })
  approved: boolean;

  @Column({ nullable: true })
  approved_no_comment: boolean;

  @Column({ nullable: true })
  crp_approved: boolean;

  @Column({ default: true })
  is_visible: boolean;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ nullable: true, type: 'longtext' })
  detail: string;

  @Column({ nullable: true, type: 'longtext' })
  original_field: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: 'tinyint', default: 0 })
  highlight_comment: number;

  @ManyToOne(() => Users, (user) => user.comments, { nullable: true })
  highlight_by: Users;

  @Column({ nullable: true, type: 'tinyint', default: 0 })
  require_changes: number;

  @Column({ nullable: true, type: 'tinyint', default: 0 })
  tpb: number;

  @Column({ nullable: true, type: 'tinyint', default: 0 })
  ppu: number;
}
