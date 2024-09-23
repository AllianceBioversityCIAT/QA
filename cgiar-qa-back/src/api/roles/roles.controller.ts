import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesHandler } from '../../shared/enum/roles-handler.enum';
import { RolesGuard } from '../../shared/guards/role.guard';

@ApiTags('Roles')
@ApiHeader({
  name: 'authentication',
  description: 'Bearer token',
})
@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 200, description: 'Role created successfully.' })
  @ApiResponse({ status: 409, description: 'Permissions do not exist.' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'All roles retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Could not access roles.' })
  findAll() {
    return this.rolesService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Patch(':id')
  @ApiOperation({ summary: 'Edit a role by ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role by ID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
