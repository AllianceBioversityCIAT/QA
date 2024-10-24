import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { RolesHandler } from '../../shared/enum/roles-handler.enum';
import { RolesGuard } from '../../shared/guards/role.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiHeader({
  name: 'authentication',
  description: 'Bearer token',
})
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'Users successfully retrieved.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async listAll() {
    return await this.usersService.findAll();
  }

  @Get(':id([0-9]+)')
  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'Users ID', type: Number })
  @ApiResponse({ status: 200, description: 'Users found.' })
  @ApiResponse({ status: 404, description: 'Users not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getOneById(@Param('id') id: number) {
    return await this.usersService.findOneById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users created successfully.',
    schema: {
      example: {
        data: {
          id: 1,
          username: 'johndoe',
          name: 'John Doe',
          email: 'johndoe@example.com',
          is_marlo: false,
          roles: [{ id: 1, description: 'ADMIN' }],
          crp: { id: 1, name: 'CRP Name' },
          createdAt: '2024-08-22T10:20:30.000Z',
          updatedAt: '2024-08-22T10:20:30.000Z',
        },
        description: 'Users created successfully.',
        status: HttpStatus.OK,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Roles not found or CRP does not exist.',
    schema: {
      example: {
        data: null,
        description: 'Roles not found.',
        status: HttpStatus.NOT_FOUND,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Username already in use.',
    schema: {
      example: {
        data: null,
        description: 'Username already in use.',
        status: HttpStatus.CONFLICT,
      },
    },
  })
  async newUser(@Body() createUserDto: CreateUserDto) {
    const response = await this.usersService.createUser(createUserDto);
    return response;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @ApiOperation({ summary: 'Edit an existing user' })
  @ApiParam({ name: 'id', description: 'Users ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users updated successfully.',
    schema: {
      example: {
        data: {
          id: 1,
          username: 'johndoe',
          name: 'John Doe',
          email: 'johndoe@example.com',
          is_marlo: false,
          roles: [{ id: 1, description: 'ADMIN' }],
          crp: { id: 1, name: 'CRP Name' },
          createdAt: '2024-08-22T10:20:30.000Z',
          updatedAt: '2024-08-22T10:25:30.000Z',
        },
        description: 'Users updated successfully.',
        status: HttpStatus.OK,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Users or roles not found.',
    schema: {
      example: {
        data: null,
        description: 'Users not found.',
        status: HttpStatus.NOT_FOUND,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Username or email already in use.',
    schema: {
      example: {
        data: null,
        description: 'Username or email already in use.',
        status: HttpStatus.CONFLICT,
      },
    },
  })
  async editUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const response = await this.usersService.editUser(id, updateUserDto);
    return response;
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @ApiOperation({ summary: 'Logically delete a user' })
  @ApiParam({ name: 'id', description: 'Users ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users deleted successfully.',
    schema: {
      example: {
        data: null,
        description: 'Users deleted successfully.',
        status: HttpStatus.OK,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Users not found.',
    schema: {
      example: {
        data: null,
        description: 'Users not found.',
        status: HttpStatus.NOT_FOUND,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete user.',
    schema: {
      example: {
        data: null,
        description: 'Failed to delete user.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    },
  })
  async deleteUser(@Param('id') id: number) {
    const response = await this.usersService.deleteUser(id);
    return response;
  }
}
