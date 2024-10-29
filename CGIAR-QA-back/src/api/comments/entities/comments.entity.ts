import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
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

  @Column({
    name: 'evaluationId',
    nullable: true,
    type: 'int',
  })
  evaluation: number;

  @ManyToOne(() => Evaluations, (evaluation) => evaluation.obj_comments)
  @JoinColumn({ name: 'evaluationId' })
  obj_evaluation: Evaluations;

  @Column({
    name: 'metaId',
    nullable: true,
  })
  meta: number;

  @ManyToOne(() => IndicatorsMeta, (meta) => meta.obj_comments, {
    nullable: true,
  })
  @JoinColumn({ name: 'metaId' })
  obj_meta: IndicatorsMeta;

  @Column({ name: 'userId' })
  userId: number;

  @ManyToOne(() => Users, (user) => user.comments)
  @JoinColumn({ name: 'userId' })
  obj_user: Users;

  @Column({
    name: 'cycleId',
    nullable: true,
  })
  cycle: number;

  @ManyToOne(() => Cycle, (cycle) => cycle.obj_comments)
  @JoinColumn({ name: 'cycleId' })
  obj_cycle: Cycle;

  @ManyToOne(() => ReplyType, (replyType) => replyType.comments)
  replyType: ReplyType;

  @OneToMany(() => CommentsReplies, (comment) => comment.obj_comment)
  obj_replies: CommentsReplies[];

  @OneToMany(() => Tags, (tag) => tag.obj_comment)
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

  @Column({ nullable: true, type: 'int', name: 'highlightById' })
  highlight_by: number;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({ name: 'highlightById' })
  obj_highlight_by: Users;

  @Column({ nullable: true, type: 'tinyint', default: 0 })
  require_changes: boolean;

  @Column({ nullable: true, type: 'tinyint', default: 0 })
  tpb: boolean;

  @Column({ nullable: true, type: 'tinyint', default: 0 })
  ppu: number;
}
