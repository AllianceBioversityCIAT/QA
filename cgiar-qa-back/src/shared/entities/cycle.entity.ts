import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('qa_cycle')
export class Cycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  end_date: Date;

  @Column({ type: 'datetime' })
  start_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cycle_stage: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cycle_name: string;

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

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  phase_year: number;
}
