import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from '../auth/repositories/permission.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly _rolesRepository: RoleRepository,
    private readonly _permissionRepository: PermissionRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { description, acronym, is_active, permissions } = createRoleDto;

    const role = new Role();
    role.description = description;
    role.acronym = acronym;
    role.is_active = is_active;

    const repositoryPermissions = await this._permissionRepository.find({
      where: { id: In(permissions) },
    });

    if (repositoryPermissions.length === 0) {
      throw new Error('Permissions do not exist');
    }

    role.permissions = repositoryPermissions;
    return await this._rolesRepository.save(role);
  }

  async findAll() {
    return await this._rolesRepository.find();
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this._rolesRepository.findOneOrFail({ where: { id } });
    const repositoryPermissions = await this._permissionRepository.find({
      where: { id: In(updateRoleDto.permissions) },
    });

    if (repositoryPermissions.length === 0) {
      throw new Error('Permissions do not exist');
    }

    Object.assign(role, updateRoleDto);
    role.permissions = repositoryPermissions;

    return await this._rolesRepository.save(role);
  }

  async remove(id: number) {
    const role = await this._rolesRepository.findOneOrFail({ where: { id } });
    return await this._rolesRepository.remove(role);
  }
}
