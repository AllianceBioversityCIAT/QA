import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUtils } from '../../utils/response.utils';
import { UserRepository } from './users.repository';
import { Users } from './entities/user.entity';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { In } from 'typeorm';
import { BcryptPasswordEncoder } from '../../utils/bcrypt.utils';
import { UserRole } from './entities/user-role.entity';
import { TokenDto } from '../../shared/global-dto/token.dto';

@Injectable()
export class UsersService {
  private _logger: Logger = new Logger(UsersService.name);

  constructor(
    private readonly _userRepository: UserRepository,
    // private readonly _generalConfigRepository: GeneralConfigurationRepository,
    // private readonly _cycleRepository: CycleRepository,
    // private readonly _bcryptPasswordEncoder: BcryptPasswordEncoder,
    // private readonly _tokenAuthRepository: TokenAuthRepository,
    private readonly _crpRepository: CrpRepository,
    private readonly _roleRepository: RoleRepository,
    private readonly _bcryptPasswordEncoder: BcryptPasswordEncoder,
  ) {}

  async findAll() {
    try {
      const users: Users[] = await this._userRepository.find({
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          is_active: true,
          is_marlo: true,
          createdAt: true,
          updatedAt: true,
          roles: true,
        },
        relations: {
          roles: true,
        },
      });

      return ResponseUtils.format({
        data: users,
        description: 'User successfully retrieved.',
        status: 200,
      });
    } catch (error) {
      return ResponseUtils.format({
        data: null,
        description: 'Error retrieving users.',
        status: 404,
      });
    }
  }

  async findOneById(id: number): Promise<any> {
    try {
      const user = await this._userRepository.findOneOrFail({ where: { id } });

      return ResponseUtils.format({
        data: user,
        description: 'User found.',
        status: 200,
      });
    } catch (error) {
      throw new NotFoundException(
        ResponseUtils.format({
          data: null,
          description: 'User not found.',
          status: 404,
        }),
      );
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    const { username, password, roles, name, email, crpId, is_marlo } =
      createUserDto;

    const user = new Users();
    user.username = username;
    user.password = password;
    user.name = name;
    user.email = email;
    user.is_marlo = is_marlo;

    const repositoryRoles = await this._roleRepository.find({
      where: { id: In(roles) },
    });
    if (repositoryRoles.length === 0) {
      return ResponseUtils.format({
        data: null,
        description: 'Roles not found.',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const userRoles = repositoryRoles.map((role) => {
      const userRole = new UserRole();
      userRole.role = role;
      userRole.user = user;
      return userRole;
    });
    user.roles = userRoles;

    if (crpId) {
      const crp = await this._crpRepository.findOne({
        where: { crp_id: crpId.toString() },
      });
      if (!crp) {
        return ResponseUtils.format({
          data: null,
          description: 'CRP does not exist.',
          status: HttpStatus.NOT_FOUND,
        });
      }
      user.crp = crp;
    }

    if (!user.is_marlo) {
      user.password = this._bcryptPasswordEncoder.encode(password);
    }

    try {
      await this._userRepository.save(user);
      return ResponseUtils.format({
        data: user,
        description: 'User created successfully.',
        status: HttpStatus.OK,
      });
    } catch (e) {
      return ResponseUtils.format({
        data: null,
        description: 'Username already in use.',
        status: HttpStatus.CONFLICT,
      });
    }
  }

  async editUser(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const { username, roles, name, email } = updateUserDto;

    const user = await this._userRepository.findOne({ where: { id } });
    if (!user) {
      return ResponseUtils.format({
        data: null,
        description: 'User not found.',
        status: HttpStatus.NOT_FOUND,
      });
    }

    user.username = username;
    user.name = name;
    user.email = email;

    const repositoryRoles = await this._roleRepository.find({
      where: { id: In(roles) },
    });
    if (repositoryRoles.length === 0) {
      return ResponseUtils.format({
        data: null,
        description: 'Roles not found.',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const userRoles = repositoryRoles.map((role) => {
      const userRole = new UserRole();
      userRole.role = role;
      userRole.user = user;
      return userRole;
    });
    user.roles = userRoles;

    try {
      await this._userRepository.save(user);
      return ResponseUtils.format({
        data: user,
        description: 'User updated successfully.',
        status: HttpStatus.OK,
      });
    } catch (e) {
      return ResponseUtils.format({
        data: null,
        description: 'Username or email already in use.',
        status: HttpStatus.CONFLICT,
      });
    }
  }

  async deleteUser(id: number): Promise<any> {
    const userExist = await this._userRepository.findOne({ where: { id } });
    if (!userExist) {
      return ResponseUtils.format({
        data: null,
        description: 'User not found.',
        status: HttpStatus.NOT_FOUND,
      });
    }

    userExist.is_active = false;
    userExist.updatedAt = new Date();

    try {
      await this._userRepository.save(userExist);
      return ResponseUtils.format({
        data: null,
        description: 'User deleted successfully.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return ResponseUtils.format({
        data: null,
        description: 'Failed to delete user.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
