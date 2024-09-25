import {
  BadRequestException,
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
import ActiveDirectory from 'activedirectory';
import config from '../../config/const.config';
import { Users } from '../users/entities/user.entity';
import { BcryptPasswordEncoder } from '../../utils/bcrypt.utils';
import { RolesHandler } from '../../shared/enum/roles-handler.enum';
import { In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
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
      throw new BadRequestException(
        'Missing required username or password fields.',
      );
    }

    try {
      let user: Users;
      let marloUser = await this._userRepository.findOne({
        where: [
          { email: username.trim().toLowerCase(), is_marlo: true },
          { username: username.trim().toLowerCase(), is_marlo: true },
        ],
        relations: ['roles', 'roles.role'],
      });

      if (marloUser) {
        const isMarlo = await this.validateAD(marloUser, password);
        if (isMarlo) {
          user = marloUser;
        } else {
          return ResponseUtils.format({
            data: {},
            description: 'User password incorrect.',
            status: HttpStatus.UNAUTHORIZED,
          });
        }
      } else {
        user = await this._userRepository.findOne({
          where: [
            { username: username.trim().toLowerCase() },
            { email: username.trim().toLowerCase() },
          ],
          relations: ['roles', 'roles.role'],
        });
        if (
          !user ||
          !this._bcryptPasswordEncoder.matches(password, user.password)
        ) {
          return ResponseUtils.format({
            data: {},
            description: 'User password incorrect.',
            status: HttpStatus.UNAUTHORIZED,
          });
        }
      }

      const userRoles = user.roles.map((userRole) => userRole.role.description);
      if (
        userRoles.includes(RolesHandler.crp) &&
        userRoles.includes(RolesHandler.assesor)
      ) {
        return ResponseUtils.format({
          data: {},
          description: 'User unauthorized.',
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const [generalConfig, currentCycle] = await Promise.all([
        this._generalConfigRepository.find({
          where: {
            roleId: In(user.roles.map((userRole) => userRole.role.id)),
            start_date: LessThanOrEqual(new Date()),
            end_date: MoreThanOrEqual(new Date()),
          },
        }),

        this._cycleRepository.find({
          where: {
            start_date: LessThanOrEqual(new Date()),
            end_date: MoreThanOrEqual(new Date()),
          },
        }),
      ]);

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        config.jwtSecret,
        { expiresIn: config.jwtTime },
      );

      user['token'] = token;
      user['config'] = generalConfig;
      user['cycle'] = currentCycle;

      delete user.password;
      // delete user.replies;

      return user;
    } catch (error) {
      this._logger.error(error.message);
      return ResponseUtils.format({
        data: {},
        description: error.message,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async validateAD(user: any, password: string): Promise<boolean> {
    const ad = new ActiveDirectory(config.active_directory);
    const adUser = user.email;

    try {
      return await new Promise<boolean>((resolve, reject) => {
        ad.authenticate(adUser, password, (err, auth) => {
          if (err) {
            if (err.errno === 'ENOTFOUND') {
              reject(new Error('Domain Controller Server not found'));
            } else {
              reject(
                new UnauthorizedException('The supplied credential is invalid'),
              );
            }
          } else if (auth) {
            resolve(true);
          } else {
            reject(
              new UnauthorizedException('The supplied credential is invalid'),
            );
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  async tokenLoginService(tokenLoginDto: TokenLoginDto) {
    const { crp_id, token } = tokenLoginDto;
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

    const user = await this._userRepository.createOrReturnUser(authToken);

    return { data: user, message: 'CRP Logged' };
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
      this._logger.error(error.message);
      return ResponseUtils.format({
        data: {},
        description: error.message,
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
        data: {},
        description: error.message,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
