import { ApiProperty } from '@nestjs/swagger';
import { RolesHandler } from '../../../shared/enum/roles-handler.enum';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Descripción del rol',
    example: RolesHandler.admin,
  })
  description: RolesHandler;

  @ApiProperty({
    description: 'Acrónimo del rol',
    example: 'ADMIN',
  })
  acronym: string;

  @ApiProperty({
    description: 'Indica si el rol está activo',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Lista de IDs de permisos asignados al rol',
    type: [Number],
    example: [1, 2, 3],
  })
  permissions: number[];
}
