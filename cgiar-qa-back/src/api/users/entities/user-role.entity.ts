import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Users } from './user.entity';

@Entity('qa_user_roles')
export class UserRole {
  @PrimaryColumn('int')
  qa_user: number;

  @PrimaryColumn('int')
  qa_role: number;

  @ManyToOne(() => Role, (role) => role.userRoles)
  @JoinColumn({ name: 'qa_role' })
  role: Role;

  @ManyToOne(() => Users, (user) => user.roles)
  @JoinColumn({ name: 'qa_user' })
  user: Users;
}
