import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Indicators } from '../../indicators/entities/indicators.entity';

@Entity('qa_comments_meta')
export class CommentsMeta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  enable_crp: boolean;

  @Column({ default: false })
  enable_assessor: boolean;

  @OneToOne(() => Indicators)
  @JoinColumn()
  indicator: Indicators;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
