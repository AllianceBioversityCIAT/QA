import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Crp } from '../../../shared/entities/crp.entity';
import { UserRole } from './user-role.entity';
import { IndicatorUser } from '../../indicators/entities/indicators-user.entity';
import { Comments } from '../../comments/entities/comments.entity';
import { CommentsReplies } from '../../comments/entities/comments-reply.entity';
import { Tags } from '../../comments/entities/tags.entity';

@Entity('qa_users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  is_marlo: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.user, { eager: true })
  roles: UserRole[];

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Comments, (comment) => comment.user)
  comments: Comments[];

  @OneToMany(() => CommentsReplies, (reply) => reply.user)
  replies: CommentsReplies[];

  @OneToMany(() => Tags, (tag) => tag.tagType)
  tags: Tags[];

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => IndicatorUser, (indicators) => indicators.user, {
    eager: true,
    cascade: true,
  })
  indicators: IndicatorUser[];

  @ManyToOne(() => Crp, (crp) => crp.id, { eager: true })
  crp: Crp;

  @ManyToMany(() => Crp, {
    eager: true,
  })
  @JoinTable({
    name: 'qa_user_crps',
    joinColumn: {
      name: 'qa_user',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'qa_crp',
      referencedColumnName: 'id',
    },
  })
  crps: Crp[];

  @Column({
    type: 'boolean',
    name: 'is_active',
  })
  is_active: boolean;
}
