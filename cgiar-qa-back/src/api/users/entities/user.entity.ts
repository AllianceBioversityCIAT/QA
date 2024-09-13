import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Crp } from '../../../shared/entities/crp.entity';
import { UserRole } from './user-role.entity';
import { IndicatorUser } from '../../indicators/entities/indicators-user.entity';
// import { QAComments } from './qacomments.entity';
// import { QACommentsReplies } from './qacommentsreplies.entity';
// import { QATags } from './qatags.entity';
// import { QAIndicatorUser } from './qaindicatoruser.entity';

@Entity('qa_users')
export class User {
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

  // @OneToMany(() => QAComments, (comment) => comment.user)
  // comments: QAComments[];

  // @OneToMany(() => QACommentsReplies, (reply) => reply.user)
  // replies: QACommentsReplies[];

  // @OneToMany(() => QATags, (tag) => tag.tagType)
  // tags: QATags[];

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
