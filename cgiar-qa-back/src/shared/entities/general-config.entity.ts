import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '../../api/roles/entities/role.entity';

@Entity('qa_general_configuration')
export class GeneralConfiguration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  end_date: Date;

  @Column({ type: 'datetime' })
  start_date: Date;

  @Column({
    type: 'enum',
    enum: ['open', 'close'],
    default: 'open',
  })
  status: 'open' | 'close';

  @Column({ type: 'varchar', length: 255, default: null })
  anual_report_guideline: string;

  @Column({ type: 'varchar', length: 255, default: null })
  innovations_guideline: string;

  @Column({ type: 'varchar', length: 255, default: null })
  partnerships_guideline: string;

  @Column({ type: 'varchar', length: 255, default: null })
  capdev_guideline: string;

  @Column({ type: 'varchar', length: 255, default: null })
  peer_review_paper_guideline: string;

  @Column({ type: 'varchar', length: 255, default: null })
  policies_guideline: string;

  @Column({ type: 'varchar', length: 255, default: null })
  almetrics_guideline: string;

  @Column({ type: 'varchar', length: 255, default: null })
  uptake_guideline: string;

  @Column({ type: 'varchar', length: 255, default: null })
  oicr_guideline: string;

  @Column({
    type: 'bigint',
    default: null,
    nullable: true,
  })
  roleId: number;

  @CreateDateColumn({
    type: 'datetime',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ManyToOne(() => Role, (role) => role.generalConfigurations)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ type: 'varchar', length: 255, default: null })
  assessors_guideline: string;
}
