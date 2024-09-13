import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GeneralConfiguration } from '../../../shared/entities/general-config.entity';
import { UserRole } from '../../users/entities/user-role.entity';

@Entity('qa_roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'SUPER_ADM', 'CRP', 'GUEST', 'ASSESSOR'],
    default: 'GUEST',
  })
  description: 'ADMIN' | 'SUPER_ADM' | 'CRP' | 'GUEST' | 'ASSESSOR';

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
  acronym: string;

  @Column({ type: 'tinyint', default: 1 })
  is_active: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];

  @OneToMany(
    () => GeneralConfiguration,
    (generalConfiguration) => generalConfiguration.role,
  )
  generalConfigurations: GeneralConfiguration[];
}
