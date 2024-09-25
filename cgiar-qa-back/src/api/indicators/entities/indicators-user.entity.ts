import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';
import { Indicators } from './indicators.entity';

@Entity('qa_indicator_user')
export class IndicatorUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.indicators, { nullable: false })
  user: Users;

  @ManyToOne(() => Indicators, (indicator) => indicator.user_indicator, {
    eager: true,
    nullable: false,
  })
  indicator: Indicators;

  @Column({ default: false })
  isLeader: boolean;

  @Column({ default: false })
  isTPB: boolean;

  @Column({ default: false })
  isPPU: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
