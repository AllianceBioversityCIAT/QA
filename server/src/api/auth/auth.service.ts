import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserRepository } from '../users/users.repository';
import { GeneralConfigurationRepository } from '../../shared/repositories/general-config.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import * as ActiveDirectory from 'activedirectory';
import config from '../../config/const.config';
import { Users } from '../users/entities/user.entity';
import { BcryptPasswordEncoder } from '../../utils/bcrypt.utils';
import { RolesHandler } from '../../shared/enum/roles-handler.enum';
import { In, LessThanOrEqual, MoreThan, MoreThanOrEqual } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmbedTokenDto } from './dto/embed-token.dto';
import { TokenLoginDto } from './dto/token-login.dto';
import { TokenAuthRepository } from './repositories/token-auth.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { TokenDto } from '../../shared/global-dto/token.dto';
import { ResponseUtils } from '../../utils/response.utils';
import { CreateGeneralConfigDto } from './dto/create-general-config.dto';
import { GeneralConfiguration } from '../../shared/entities/general-config.entity';
import { TokenAuth } from './entities/token-auth.entity';

@Injectable()
export class AuthService {
  private readonly _logger = new Logger(AuthService.name);
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _generalConfigRepository: GeneralConfigurationRepository,
    private readonly _cycleRepository: CycleRepository,
    private readonly _bcryptPasswordEncoder: BcryptPasswordEncoder,
    private readonly _tokenAuthRepository: TokenAuthRepository,
    private readonly _crpRepository: CrpRepository,
  ) {}

  async loginService(loginDto: LoginDto): Promise<any> {
    const { username, password } = loginDto;
    if (!(username && password)) {
      return ResponseUtils.format({
        data: null,
        description: 'Username and password are required.',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    try {
      let user: Users;
      const marloUser = await this._userRepository.findOne({
        where: [
          { email: username.trim().toLowerCase(), is_marlo: true },
          { username: username.trim().toLowerCase(), is_marlo: true },
        ],
        relations: {
          roles: {
            role: true,
          },
          crp: true,
          crps: true,
          indicators: {
            indicator: {
              comment_meta: true,
            },
          },
        },
      });

      if (marloUser) {
        const isMarlo = await this.validateAD(marloUser, password);
        this._logger.log('Is Marlo: ' + isMarlo);
        if (isMarlo) {
          user = marloUser;
        } else {
          return ResponseUtils.format({
            data: null,
            description: 'User not found or password incorrect.',
            status: HttpStatus.UNAUTHORIZED,
            errors: 'User not found or password incorrect.',
          });
        }
      } else {
        user = await this._userRepository.findOne({
          where: [
            { username: username.trim().toLowerCase() },
            { email: username.trim().toLowerCase() },
          ],
          relations: {
            roles: {
              role: true,
            },
            crp: true,
            crps: true,
            indicators: {
              indicator: {
                comment_meta: true,
              },
            },
          },
        });
        if (
          !user ||
          !this._bcryptPasswordEncoder.matches(password, user.password)
        ) {
          this._logger.error('User not found or password incorrect.');
          return ResponseUtils.format({
            data: null,
            description: 'User not found or password incorrect.',
            status: HttpStatus.UNAUTHORIZED,
            errors: 'User not found or password incorrect.',
          });
        }
      }

      this._logger.log('User found: ' + user.username);

      const userRoles = user.roles.map((userRole) => userRole.role.description);
      if (
        userRoles.includes(RolesHandler.crp) &&
        userRoles.includes(RolesHandler.assesor)
      ) {
        this._logger.log('User is CRP and Assessor');
        return ResponseUtils.format({
          data: null,
          description:
            'User is CRP and Assessor, please contact the Technical Team.',
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const [generalConfig, currentCycle] = await Promise.all([
        this._generalConfigRepository.find({
          where: {
            roleId: In(user.roles.map((userRole) => userRole.role.id)),
            start_date: LessThanOrEqual(new Date()),
            end_date: MoreThan(new Date()),
          },
        }),

        this._cycleRepository.find({
          where: {
            start_date: LessThanOrEqual(new Date()),
            end_date: MoreThan(new Date()),
          },
        }),
      ]);

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.roles },
        config.jwtSecret,
        { expiresIn: config.jwtTime },
      );
      const formattedUser = {
        ...user,
        roles: user.roles.map((userRole) => ({
          id: userRole.role.id,
          description: userRole.role.description,
          createdAt: userRole.role.createdAt,
          updatedAt: userRole.role.updatedAt,
          acronym: userRole.role.acronym,
          is_active: userRole.role.is_active,
          permissions: userRole.role.permissions,
        })),
        token,
        config: generalConfig,
        cycle: currentCycle[0],
      };

      delete formattedUser.password;

      return ResponseUtils.format({
        data: formattedUser,
        description: 'User logged.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      console.log('🚀 ~ AuthService ~ loginService ~ error:', error);
      this._logger.error(error);
      return ResponseUtils.format({
        data: null,
        description: error.response.errorMessage || error,
        status: error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async validateAD(user: any, password: string): Promise<boolean> {
    const ad = new ActiveDirectory(config.active_directory);
    const adUser = user.email;

    try {
      const valid = await new Promise<boolean>((resolve, reject) => {
        ad.authenticate(adUser, password, (err, auth) => {
          if (auth) {
            this._logger.log('User authenticated');
            resolve(true);
          } else if (err) {
            if (err.errno) {
              this._logger.error('Domain Controller Server not found');
              reject(new Error('Domain Controller Server not found'));
            } else {
              reject(
                new UnauthorizedException('The supplied credential is invalid'),
              );
            }
          } else {
            reject(
              new UnauthorizedException('The supplied credential is invalid'),
            );
          }
        });
      });
      return valid;
    } catch (error) {
      throw error;
    }
  }

  async tokenLoginService(tokenLoginDto: TokenLoginDto) {
    const { crp_id, token } = tokenLoginDto;
    try {
      if (!(crp_id && token)) {
        throw new BadRequestException('CRP ID and token are required.');
      }

      const crp = await this._crpRepository.findOne({ where: { crp_id } });
      if (!crp) {
        throw new NotFoundException('CRP not found.');
      }

      const authToken = await this._tokenAuthRepository.findOne({
        where: { crp_id, token },
      });
      if (!authToken) {
        throw new BadRequestException('Invalid token.');
      }

      const user: Users =
        await this._userRepository.createOrReturnUser(authToken);

      return ResponseUtils.format({
        data: user,
        description: 'CRP Logged',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto, user: TokenDto) {
    const { oldPassword, newPassword } = changePasswordDto;
    if (!(oldPassword && newPassword)) {
      throw new BadRequestException(
        'Old password and new password are required.',
      );
    }

    let userExist = await this._userRepository.findOne({
      where: { id: user.userId },
    });
    if (!userExist) {
      throw new NotFoundException('User not found.');
    }

    const isPasswordValid = this._bcryptPasswordEncoder.matches(
      oldPassword,
      userExist.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Old password does not match.');
    }

    userExist.password = newPassword;

    userExist.password = this._bcryptPasswordEncoder.encode(newPassword);
    userExist = await this._userRepository.save(userExist);

    delete userExist.password;

    return { data: user };
  }

  async createGeneralConfig(createConfigDto: CreateGeneralConfigDto) {
    try {
      const newGeneralConfig = new GeneralConfiguration();
      newGeneralConfig.start_date = createConfigDto.start_date;
      newGeneralConfig.end_date = createConfigDto.end_date;
      newGeneralConfig.status = createConfigDto.status;
      newGeneralConfig.anual_report_guideline =
        createConfigDto.anual_report_guideline;
      newGeneralConfig.assessors_guideline =
        createConfigDto.assessors_guideline;
      newGeneralConfig.innovations_guideline =
        createConfigDto.innovations_guideline;
      newGeneralConfig.partnerships_guideline =
        createConfigDto.partnerships_guideline;
      newGeneralConfig.capdev_guideline = createConfigDto.capdev_guideline;

      const generalConfig =
        await this._generalConfigRepository.save(newGeneralConfig);

      return ResponseUtils.format({
        data: generalConfig,
        description: 'Configuration successfully created.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error(error);
      return ResponseUtils.format({
        data: null,
        description: error,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async embedToken(embedTokenDto: EmbedTokenDto): Promise<any> {
    const { token, expiration_date, crp_id, username, email, name, app_user } =
      embedTokenDto;

    try {
      let tokenEmbed = new TokenAuth();

      tokenEmbed.token = token;
      tokenEmbed.expiration_date = expiration_date;
      tokenEmbed.crp_id = crp_id;
      tokenEmbed.username = username;
      tokenEmbed.email = email;
      tokenEmbed.name = name;
      tokenEmbed.app_user = app_user;

      tokenEmbed = await this._tokenAuthRepository.save(tokenEmbed);

      return {
        data: tokenEmbed,
        message: 'Token successfully saved in QA',
      };
    } catch (error) {
      this._logger.error('An error occurred while saving the token', error);
      return ResponseUtils.format({
        data: null,
        description: error,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
