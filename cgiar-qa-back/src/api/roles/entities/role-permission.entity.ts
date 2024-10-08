import { Entity, PrimaryColumn } from 'typeorm';

@Entity('qa_roles_permissions')
export class RolePermission {
  @PrimaryColumn('int')
  qa_role: number;

  @PrimaryColumn('int')
  qa_permissions: number;
}
