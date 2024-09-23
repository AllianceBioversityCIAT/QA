import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('qa_batch')
export class Batch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  submission_date: Date;

  @Column()
  assessors_start_date: Date;

  @Column()
  assessors_end_date: Date;

  @Column()
  programs_start_date: Date;

  @Column()
  programs_end_date: Date;

  @Column({ nullable: true })
  batch_name: string;

  @Column({ nullable: true, type: 'varchar', length: 45 })
  qa_batchcol: string;

  @Column('decimal', { precision: 10, scale: 0 })
  phase_year: number;

  @Column({ nullable: true, name: 'idts_start_date' })
  idts_start_date: Date;

  @Column({ nullable: true, name: 'idts_end_date' })
  idts_end_date: Date;

  @Column({ nullable: true, name: 'lead_assesor_start_date' })
  lead_assesor_start_date: Date;

  @Column({ nullable: true, name: 'lead_assesor_end_date' })
  lead_assesor_end_date: Date;

  @Column({ nullable: true, name: 'tpb_start_date' })
  tpb_start_date: Date;

  @Column({ nullable: true, name: 'tpb_end_date' })
  tpb_end_date: Date;

  @Column({ nullable: true, name: 'ppu_start_date' })
  ppu_start_date: Date;

  @Column({ nullable: true, name: 'ppu_end_date' })
  ppu_end_date: Date;

  @Column({ nullable: true, name: 'is_open' })
  is_open: boolean;

  @Column({ nullable: true, type: 'text', name: 'qa_batch_desc' })
  qa_batch_desc: string;
}
