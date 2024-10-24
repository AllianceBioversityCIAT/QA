import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Comments } from '../../comments/entities/comments.entity';
import { Users } from '../../users/entities/user.entity';
import { EvaluationStatusHandler } from '../enum/evaluation-status-handler.enum';
import { StatusHandler } from '../enum/status-handler.enum';

@Entity('qa_evaluations') // Define el nombre de la tabla
export class Evaluations {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  indicator_view_id: number;

  @Column({
    type: 'enum',
    enum: StatusHandler,
    default: StatusHandler.Pending,
  })
  status: StatusHandler;

  @Column({
    type: 'enum',
    enum: EvaluationStatusHandler,
    nullable: true,
  })
  evaluation_status: EvaluationStatusHandler;

  @Column({ length: 200 })
  indicator_view_name: string;

  @Column({ length: 200, default: '' })
  crp_id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Comments, (comment) => comment.evaluation)
  comments: Comments[];

  @Column('decimal', { precision: 10, scale: 0 })
  phase_year: number;

  @ManyToMany(() => Users)
  @JoinTable()
  assessed_by: Users[];

  @ManyToMany(() => Users)
  @JoinTable()
  assessed_by_second_round: Users[];

  @Column({
    type: 'datetime',
    default: () => 'NOW()',
  })
  batchDate: Date;

  @Column({ default: false })
  require_second_assessment: boolean;
}
