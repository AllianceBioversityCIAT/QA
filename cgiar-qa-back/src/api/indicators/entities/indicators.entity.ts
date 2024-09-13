import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IndicatorUser } from './indicators-user.entity';
import { IndicatorsMeta } from './indicators-meta.entity';

@Entity('qa_indicators')
@Unique(['name', 'view_name'])
export class Indicators {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  primary_field: string;

  @Column()
  view_name: string;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => IndicatorUser, (indicators) => indicators.indicator)
  user_indicator: IndicatorUser[];

  @OneToMany(() => IndicatorsMeta, (meta) => meta.indicator, {
    eager: true,
  })
  meta: IndicatorsMeta[];

  // @OneToOne(() => CommentsMeta, (comments_meta) => comments_meta.indicator, {
  //   eager: true,
  // })
  // comment_meta: CommentsMeta;

  @Column({
    nullable: true,
    type: 'longtext',
  })
  qa_criteria: string;

  @Column({
    nullable: true,
    type: 'boolean',
    default: true,
  })
  is_active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
