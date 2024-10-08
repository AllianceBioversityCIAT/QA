import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Indicators } from './indicators.entity';
import { Comments } from '../../comments/entities/comments.entity';

@Entity('qa_indicators_meta')
export class IndicatorsMeta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  col_name: string;

  @Column({ length: 200 })
  display_name: string;

  @ManyToOne(() => Indicators, (indicator) => indicator.meta, {
    nullable: false,
  })
  indicator: Indicators;

  @Column({ default: true })
  enable_comments: boolean;

  @Column({ default: false })
  is_primay: boolean;

  @Column({ default: true })
  include_general: boolean;

  @Column({ default: true })
  include_detail: boolean;

  @Column({ default: 0 })
  order: number;

  @Column({
    nullable: true,
    type: 'longtext',
  })
  description: string;

  @OneToMany(() => Comments, (comment) => comment.meta)
  comments: Comments[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    nullable: true,
    type: 'tinyint',
    default: 0,
  })
  is_core: number;

  @Column({
    nullable: true,
    type: 'text',
  })
  indicator_slug: string;
}
