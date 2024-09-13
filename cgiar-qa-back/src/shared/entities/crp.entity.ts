import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../api/users/entities/user.entity';

@Entity('qa_crp')
export class Crp {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  crp_id: string;

  @Column({ type: 'varchar', length: 255 })
  acronym: string;

  @Column({ type: 'tinyint' })
  is_marlo: boolean;

  @Column({ type: 'tinyint', default: 0 })
  active: boolean;

  @Column({
    type: 'enum',
    enum: ['open', 'close'],
    default: 'close',
  })
  qa_active: 'open' | 'close';

  @Column({ type: 'text' })
  action_area: string;
}
