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
import { AuthMicroserviceService } from '../../shared/microservice/auth-microservice/auth-microservice.service';

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
    private readonly _authMicroservice: AuthMicroserviceService,
  ) {}

  // async loginService(loginDto: LoginDto): Promise<any> {
  //   const { username, password } = loginDto;
  //   if (!(username && password)) {
  //     return ResponseUtils.format({
  //       data: null,
  //       description: 'Username and password are required.',
  //       status: HttpStatus.BAD_REQUEST,
  //     });
  //   }

  //   try {
  //     let user: Users;
  //     const marloUser = await this._userRepository.findOne({
  //       where: [
  //         { email: username.trim().toLowerCase(), is_marlo: true },
  //         { username: username.trim().toLowerCase(), is_marlo: true },
  //       ],
  //       relations: {
  //         roles: {
  //           role: true,
  //         },
  //         crp: true,
  //         crps: true,
  //         indicators: {
  //           indicator: {
  //             comment_meta: true,
  //           },
  //         },
  //       },
  //     });

  //     if (marloUser) {
  //       const isMarlo = await this.validateAD(marloUser, password);
  //       this._logger.log('Is Marlo: ' + isMarlo);
  //       if (isMarlo) {
  //         user = marloUser;
  //       } else {
  //         return ResponseUtils.format({
  //           data: null,
  //           description: 'User not found or password incorrect.',
  //           status: HttpStatus.UNAUTHORIZED,
  //           errors: 'User not found or password incorrect.',
  //         });
  //       }
  //     } else {
  //       user = await this._userRepository.findOne({
  //         where: [
  //           { username: username.trim().toLowerCase() },
  //           { email: username.trim().toLowerCase() },
  //         ],
  //         relations: {
  //           roles: {
  //             role: true,
  //           },
  //           crp: true,
  //           crps: true,
  //           indicators: {
  //             indicator: {
  //               comment_meta: true,
  //             },
  //           },
  //         },
  //       });
  //       if (
  //         !user ||
  //         !this._bcryptPasswordEncoder.matches(password, user.password)
  //       ) {
  //         this._logger.error('User not found or password incorrect.');
  //         return ResponseUtils.format({
  //           data: null,
  //           description: 'User not found or password incorrect.',
  //           status: HttpStatus.UNAUTHORIZED,
  //           errors: 'User not found or password incorrect.',
  //         });
  //       }
  //     }

  //     this._logger.log('User found: ' + user.username);

  //     const userRoles = user.roles.map((userRole) => userRole.role.description);
  //     if (
  //       userRoles.includes(RolesHandler.crp) &&
  //       userRoles.includes(RolesHandler.assesor)
  //     ) {
  //       this._logger.log('User is CRP and Assessor');
  //       return ResponseUtils.format({
  //         data: null,
  //         description:
  //           'User is CRP and Assessor, please contact the Technical Team.',
  //         status: HttpStatus.UNAUTHORIZED,
  //       });
  //     }

  //     const [generalConfig, currentCycle] = await Promise.all([
  //       this._generalConfigRepository.find({
  //         where: {
  //           roleId: In(user.roles.map((userRole) => userRole.role.id)),
  //           start_date: LessThanOrEqual(new Date()),
  //           end_date: MoreThan(new Date()),
  //         },
  //       }),

  //       this._cycleRepository.find({
  //         where: {
  //           start_date: LessThanOrEqual(new Date()),
  //           end_date: MoreThan(new Date()),
  //         },
  //       }),
  //     ]);

  //     const token = jwt.sign(
  //       { userId: user.id, username: user.username, role: user.roles },
  //       config.jwtSecret,
  //       { expiresIn: config.jwtTime },
  //     );
  //     const formattedUser = {
  //       ...user,
  //       roles: user.roles.map((userRole) => ({
  //         id: userRole.role.id,
  //         description: userRole.role.description,
  //         createdAt: userRole.role.createdAt,
  //         updatedAt: userRole.role.updatedAt,
  //         acronym: userRole.role.acronym,
  //         is_active: userRole.role.is_active,
  //         permissions: userRole.role.permissions,
  //       })),
  //       token,
  //       config: generalConfig,
  //       cycle: currentCycle[0],
  //     };

  //     delete formattedUser.password;

  //     return ResponseUtils.format({
  //       data: formattedUser,
  //       description: 'User logged.',
  //       status: HttpStatus.OK,
  //     });
  //   } catch (error) {
  //     this._logger.error(error);
  //     return ResponseUtils.format({
  //       data: null,
  //       description: 'An error occurred while logging in, please try again.',
  //       status: HttpStatus.INTERNAL_SERVER_ERROR,
  //     });
  //   }
  // }

  /**
   * Validates the user's credentials against Active Directory.
   * @param user - The user object containing username and password.
   * @param password - The password to validate.
   * @returns A boolean indicating whether the credentials are valid.
   */
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
      const user = await this._userRepository.findOne({
        where: [
          { email: username.trim().toLowerCase(), is_active: true },
          { username: username.trim().toLowerCase(), is_active: true },
        ],
        relations: {
          roles: { role: true },
          crp: true,
          crps: true,
          indicators: { indicator: { comment_meta: true } },
        },
      });

      if (!user) {
        return ResponseUtils.format({
          data: null,
          description:
            'User not found in local database. Please contact support.',
          status: HttpStatus.NOT_FOUND,
        });
      }

      const userMetadata = {
        firstName: user.name,
        lastName: user.username,
        email: user.email,
      };

      const authResponse =
        await this._authMicroservice.authenticateWithCustomCredentials(
          user.email,
          password,
          userMetadata,
        );

      if (authResponse?.challengeName === 'NEW_PASSWORD_REQUIRED') {
        this._logger.log(
          `User ${user.email} needs to set a new password (first login)`,
        );
        return {
          message: 'Password change required. Please set a new password.',
          response: {
            valid: false,
            challengeRequired: true,
            challengeName: 'NEW_PASSWORD_REQUIRED',
            session: authResponse.session,
            userAttributes: authResponse.userAttributes,
            userId: authResponse.userId,
            localUser: {
              id: user.id,
              email: user.email,
              firstName: user.name,
              username: user.username,
            },
          },
          status: HttpStatus.ACCEPTED,
        };
      }

      if (!authResponse.tokens) {
        throw new Error(
          'Invalid authentication response from Auth Microservice',
        );
      }

      return await this.buildUserAuthResponse(user);
    } catch (error) {
      this._logger.error(
        `Authentication error for ${username}: ${error.message}`,
        error.stack,
      );
      return ResponseUtils.format({
        data: null,
        description: error.message ?? 'Authentication failed',
        status: error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  /**
   * Get Auth URL
   * @param provider
   * @returns Authentication URL for the specified provider
   * @description This method generates an authentication URL for the specified OAuth provider.
   */
  async getAuthURL(provider: string): Promise<any> {
    try {
      this._logger.log(`Getting authentication URL for provider: ${provider}`);

      const response =
        await this._authMicroservice.getAuthenticationUrl(provider);

      return {
        message: 'Authentication URL generated successfully',
        response: response,
        status: HttpStatus.OK,
      };
    } catch (error) {
      this._logger.error(
        `Error getting authentication URL: ${error.message}`,
        error.stack,
      );
      return ResponseUtils.format({
        data: null,
        description: error.message ?? 'Failed to get authentication URL',
        status: error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  /**
   * Validate Authorization Code
   * @param authCodeDto
   * @returns User information and tokens if validation is successful
   * @description This method validates an authorization code and retrieves user information.
   */
  async validateAuthCode(authCodeDto: { code: string }): Promise<any> {
    try {
      this._logger.log('Validando código de autorización');

      const authResponse =
        await this._authMicroservice.validateAuthorizationCode(
          authCodeDto.code,
        );

      const userInfo = authResponse.userInfo;

      if (!userInfo?.email) {
        return ResponseUtils.format({
          data: null,
          description: 'The user does not have an email address.',
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const user = await this._userRepository.findOne({
        where: { email: userInfo.email.toLowerCase(), is_active: true },
        relations: {
          roles: { role: true },
          crp: true,
          crps: true,
          indicators: { indicator: { comment_meta: true } },
        },
      });

      if (!user) {
        return ResponseUtils.format({
          data: null,
          description:
            'User not found in local database. Please contact support.',
          status: HttpStatus.NOT_FOUND,
        });
      }

      return await this.buildUserAuthResponse(user, authResponse.tokens);
    } catch (error) {
      this._logger.error(
        `Error validating auth code: ${error.message}`,
        error.stack,
      );
      return ResponseUtils.format({
        data: null,
        description: error.message ?? 'Authentication failed',
        status: error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  /**
   * Completes the password challenge for a user.
   * @param challengeDto - Contains username, new password, and session.
   * @returns Response with user data and tokens if successful.
   */
  async completePasswordChallenge(challengeDto: {
    username: string;
    newPassword: string;
    session: string;
  }): Promise<any> {
    try {
      this._logger.log(
        `Completing password challenge for user: ${challengeDto.username}`,
      );

      const user = await this._userRepository.findOne({
        where: {
          email: challengeDto.username.trim().toLowerCase(),
          is_active: true,
        },
        relations: {
          roles: { role: true },
          crp: true,
          crps: true,
          indicators: { indicator: { comment_meta: true } },
        },
      });

      if (!user) {
        return ResponseUtils.format({
          data: null,
          description: 'User not found in local database',
          status: HttpStatus.NOT_FOUND,
        });
      }

      const authResponse =
        await this._authMicroservice.completeNewPasswordChallenge({
          username: challengeDto.username,
          newPassword: challengeDto.newPassword,
          session: challengeDto.session,
        });

      if (!authResponse.tokens) {
        throw new Error(
          'Invalid response from Auth Microservice - no tokens received',
        );
      }

      return await this.buildUserAuthResponse(user, authResponse.tokens);
    } catch (error) {
      this._logger.error(
        `Error completing password challenge: ${error.message}`,
        error.stack,
      );
      return ResponseUtils.format({
        data: null,
        description: error.message ?? 'Failed to complete password challenge',
        status: error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  /**
   * Builds the user authentication response.
   * @param user - The user object.
   * @param tokens - Optional tokens for OAuth providers.
   * @param description - Description of the response.
   * @returns Formatted user response with authentication details.
   */
  private async buildUserAuthResponse(
    user: Users,
    tokens?: any,
    description = 'User logged.',
  ): Promise<any> {
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

    const formattedUser: any = {
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

    if (tokens) {
      formattedUser.auth_tokens = {
        accessToken: tokens.accessToken,
        idToken: tokens.idToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      };
    }

    delete formattedUser.password;

    return ResponseUtils.format({
      data: formattedUser,
      description,
      status: HttpStatus.OK,
    });
  }

  async validateAD(user: any, password: string): Promise<boolean> {
    const ad = new ActiveDirectory(config.active_directory);
    this._logger.log('Validating user in AD', ad);
    const adUser = user.email;

    try {
      const valid = await new Promise<boolean>((resolve, reject) => {
        ad.authenticate(adUser, password, (err, auth) => {
          if (auth) {
            this._logger.log('User authenticated');
            resolve(true);
          } else if (err) {
            this._logger.error(err);
            if (err.errno) {
              this._logger.error('Domain Controller Server not found');
              reject();
            } else {
              reject();
            }
          } else {
            reject();
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
        return ResponseUtils.format({
          data: null,
          description: 'CRP ID and token are required.',
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const crp = await this._crpRepository.findOne({ where: { crp_id } });
      if (!crp) {
        return ResponseUtils.format({
          data: null,
          description: 'CRP not found.',
          status: HttpStatus.NOT_FOUND,
        });
      }

      const authToken = await this._tokenAuthRepository.findOne({
        where: { crp_id, token },
      });
      if (!authToken) {
        return ResponseUtils.format({
          data: null,
          description: 'Token not found.',
          status: HttpStatus.NOT_FOUND,
        });
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
      return ResponseUtils.format({
        data: null,
        description: error.message,
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        errors: error.message,
      });
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

    return ResponseUtils.format({
      data: user,
      description: 'Password changed successfully.',
      status: HttpStatus.OK,
    });
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

      return ResponseUtils.format({
        data: tokenEmbed,
        description: 'Token saved successfully.',
        status: HttpStatus.OK,
      });
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
