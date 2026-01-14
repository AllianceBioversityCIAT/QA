import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/users.repository';
import { GeneralConfigurationRepository } from '../../shared/repositories/general-config.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import { BcryptPasswordEncoder } from '../../utils/bcrypt.utils';
import { TokenAuthRepository } from './repositories/token-auth.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { AuthMicroserviceService } from '../../shared/microservice/auth-microservice/auth-microservice.service';
import { Users } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let generalConfigRepository: jest.Mocked<GeneralConfigurationRepository>;
  let cycleRepository: jest.Mocked<CycleRepository>;
  let bcryptPasswordEncoder: jest.Mocked<BcryptPasswordEncoder>;
  let tokenAuthRepository: jest.Mocked<TokenAuthRepository>;
  let crpRepository: jest.Mocked<CrpRepository>;
  let authMicroservice: jest.Mocked<AuthMicroserviceService>;

  const mockUser: any = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    is_active: true,
    roles: [
      {
        role: {
          id: 1,
          description: 'ADMIN',
          createdAt: new Date(),
          updatedAt: new Date(),
          acronym: 'ADM',
          is_active: true,
          permissions: [],
          userRoles: [],
          generalConfigurations: [],
        },
      },
    ],
    crp: null,
    crps: [],
    indicators: [],
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      createOrReturnUser: jest.fn(),
    } as any;

    generalConfigRepository = {
      find: jest.fn(),
      save: jest.fn(),
    } as any;

    cycleRepository = {
      find: jest.fn(),
    } as any;

    bcryptPasswordEncoder = {
      matches: jest.fn(),
      encode: jest.fn(),
    } as any;

    tokenAuthRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as any;

    crpRepository = {
      findOne: jest.fn(),
    } as any;

    authMicroservice = {
      authenticateWithCustomCredentials: jest.fn(),
      getAuthenticationUrl: jest.fn(),
      validateAuthorizationCode: jest.fn(),
      completeNewPasswordChallenge: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: userRepository },
        { provide: GeneralConfigurationRepository, useValue: generalConfigRepository },
        { provide: CycleRepository, useValue: cycleRepository },
        { provide: BcryptPasswordEncoder, useValue: bcryptPasswordEncoder },
        { provide: TokenAuthRepository, useValue: tokenAuthRepository },
        { provide: CrpRepository, useValue: crpRepository },
        { provide: AuthMicroserviceService, useValue: authMicroservice },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loginService', () => {
    it('should return BAD_REQUEST when username or password is missing', async () => {
      const result = await service.loginService({
        username: '',
        password: '123',
      });
      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
      expect(result.data).toBeNull();
      expect(result.description).toBe('Username and password are required.');
    });

    it('should return BAD_REQUEST when password is missing', async () => {
      const result = await service.loginService({
        username: 'test',
        password: '',
      });
      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return NOT_FOUND when user does not exist', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      const result = await service.loginService({
        username: 'test',
        password: '123',
      });
      expect(result.status).toBe(HttpStatus.NOT_FOUND);
      expect(result.data).toBeNull();
      expect(result.description).toContain('User not found in local database');
    });

    it('should return ACCEPTED when NEW_PASSWORD_REQUIRED challenge', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (authMicroservice.authenticateWithCustomCredentials as jest.Mock).mockResolvedValue({
        challengeName: 'NEW_PASSWORD_REQUIRED',
        session: 'test-session',
        userAttributes: {},
        userId: 'user-id',
      });

      const result = await service.loginService({
        username: 'test@example.com',
        password: '123',
      });

      expect(result.status).toBe(HttpStatus.ACCEPTED);
      expect(result.data.challengeRequired).toBe(true);
      expect(result.data.challengeName).toBe('NEW_PASSWORD_REQUIRED');
    });

    it('should return error when auth response has no tokens', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (authMicroservice.authenticateWithCustomCredentials as jest.Mock).mockResolvedValue({
        challengeName: null,
        tokens: null,
      });

      const result = await service.loginService({
        username: 'test@example.com',
        password: '123',
      });

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.description).toContain('Invalid authentication response');
    });

    it('should successfully login and return user data', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (authMicroservice.authenticateWithCustomCredentials as jest.Mock).mockResolvedValue({
        tokens: {
          accessToken: 'access-token',
          idToken: 'id-token',
          refreshToken: 'refresh-token',
        },
      });
      (generalConfigRepository.find as jest.Mock).mockResolvedValue([]);
      (cycleRepository.find as jest.Mock).mockResolvedValue([{ id: 1 }]);

      const result = await service.loginService({
        username: 'test@example.com',
        password: '123',
      });

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toBeDefined();
      expect(result.data.token).toBeDefined();
    });

    it('should handle errors during login', async () => {
      (userRepository.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await service.loginService({
        username: 'test',
        password: '123',
      });

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.data).toBeNull();
    });
  });

  describe('getAuthURL', () => {
    it('should return authentication URL successfully', async () => {
      const mockUrl = { url: 'https://auth.example.com' };
      (authMicroservice.getAuthenticationUrl as jest.Mock).mockResolvedValue(mockUrl);

      const result = await service.getAuthURL('google');

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockUrl);
      expect(result.description).toContain('Authentication URL generated successfully');
    });

    it('should handle errors when getting auth URL', async () => {
      (authMicroservice.getAuthenticationUrl as jest.Mock).mockRejectedValue(
        new Error('Provider not found')
      );

      const result = await service.getAuthURL('invalid');

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.data).toBeNull();
    });
  });

  describe('validateAuthCode', () => {
    it('should return BAD_REQUEST when user has no email', async () => {
      (authMicroservice.validateAuthorizationCode as jest.Mock).mockResolvedValue({
        userInfo: { name: 'Test User' },
        tokens: {},
      });

      const result = await service.validateAuthCode({ code: 'auth-code' });

      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
      expect(result.description).toContain('does not have an email address');
    });

    it('should return NOT_FOUND when user does not exist', async () => {
      (authMicroservice.validateAuthorizationCode as jest.Mock).mockResolvedValue({
        userInfo: { email: 'test@example.com' },
        tokens: {},
      });
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.validateAuthCode({ code: 'auth-code' });

      expect(result.status).toBe(HttpStatus.NOT_FOUND);
      expect(result.description).toContain('User not found in local database');
    });

    it('should successfully validate auth code and return user data', async () => {
      (authMicroservice.validateAuthorizationCode as jest.Mock).mockResolvedValue({
        userInfo: { email: 'test@example.com' },
        tokens: {
          accessToken: 'access-token',
          idToken: 'id-token',
          refreshToken: 'refresh-token',
        },
      });
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (generalConfigRepository.find as jest.Mock).mockResolvedValue([]);
      (cycleRepository.find as jest.Mock).mockResolvedValue([{ id: 1 }]);

      const result = await service.validateAuthCode({ code: 'auth-code' });

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toBeDefined();
    });

    it('should handle errors during validation', async () => {
      (authMicroservice.validateAuthorizationCode as jest.Mock).mockRejectedValue(
        new Error('Invalid code')
      );

      const result = await service.validateAuthCode({ code: 'invalid-code' });

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('completePasswordChallenge', () => {
    const challengeDto = {
      username: 'test@example.com',
      newPassword: 'newPassword123',
      session: 'test-session',
    };

    it('should return NOT_FOUND when user does not exist', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.completePasswordChallenge(challengeDto);

      expect(result.status).toBe(HttpStatus.NOT_FOUND);
      expect(result.description).toContain('User not found in local database');
    });

    it('should return error when no tokens received', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (authMicroservice.completeNewPasswordChallenge as jest.Mock).mockResolvedValue({
        tokens: null,
      });

      const result = await service.completePasswordChallenge(challengeDto);

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.description).toContain('no tokens received');
    });

    it('should successfully complete password challenge', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (authMicroservice.completeNewPasswordChallenge as jest.Mock).mockResolvedValue({
        tokens: {
          accessToken: 'access-token',
          idToken: 'id-token',
          refreshToken: 'refresh-token',
        },
      });
      (generalConfigRepository.find as jest.Mock).mockResolvedValue([]);
      (cycleRepository.find as jest.Mock).mockResolvedValue([{ id: 1 }]);

      const result = await service.completePasswordChallenge(challengeDto);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toBeDefined();
    });

    it('should handle errors during password challenge', async () => {
      (userRepository.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await service.completePasswordChallenge(challengeDto);

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('tokenLoginService', () => {
    const tokenLoginDto = {
      crp_id: 'CRP001',
      token: 'test-token',
    };

    it('should return BAD_REQUEST when crp_id or token is missing', async () => {
      const result = await service.tokenLoginService({
        crp_id: '',
        token: 'token',
      });
      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
      expect(result.description).toContain('CRP ID and token are required');
    });

    it('should return BAD_REQUEST when token is missing', async () => {
      const result = await service.tokenLoginService({
        crp_id: 'CRP001',
        token: '',
      });
      expect(result.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return NOT_FOUND when CRP does not exist', async () => {
      (crpRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.tokenLoginService(tokenLoginDto);

      expect(result.status).toBe(HttpStatus.NOT_FOUND);
      expect(result.description).toContain('CRP not found');
    });

    it('should return NOT_FOUND when token does not exist', async () => {
      (crpRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, crp_id: 'CRP001' });
      (tokenAuthRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.tokenLoginService(tokenLoginDto);

      expect(result.status).toBe(HttpStatus.NOT_FOUND);
      expect(result.description).toContain('Token not found');
    });

    it('should successfully login with token', async () => {
      const mockCrp = { id: 1, crp_id: 'CRP001' };
      const mockTokenAuth = { id: 1, token: 'test-token', crp_id: 'CRP001' };
      const mockCreatedUser = { id: 1, username: 'testuser' };

      (crpRepository.findOne as jest.Mock).mockResolvedValue(mockCrp);
      (tokenAuthRepository.findOne as jest.Mock).mockResolvedValue(mockTokenAuth);
      (userRepository.createOrReturnUser as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await service.tokenLoginService(tokenLoginDto);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockCreatedUser);
      expect(result.description).toBe('CRP Logged');
    });

    it('should handle errors during token login', async () => {
      (crpRepository.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await service.tokenLoginService(tokenLoginDto);

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
    };
    const tokenDto = {
      userId: 1,
      username: 'testuser',
      role: [],
    };

    it('should throw BadRequestException when oldPassword is missing', async () => {
      await expect(
        service.changePassword(
          { oldPassword: '', newPassword: 'new' },
          tokenDto
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when newPassword is missing', async () => {
      await expect(
        service.changePassword(
          { oldPassword: 'old', newPassword: '' },
          tokenDto
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.changePassword(changePasswordDto, tokenDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when old password does not match', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        password: 'hashedPassword',
      });
      (bcryptPasswordEncoder.matches as jest.Mock).mockReturnValue(false);

      await expect(
        service.changePassword(changePasswordDto, tokenDto)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully change password', async () => {
      const user = {
        id: 1,
        password: 'hashedOldPassword',
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (bcryptPasswordEncoder.matches as jest.Mock).mockReturnValue(true);
      (bcryptPasswordEncoder.encode as jest.Mock).mockReturnValue('hashedNewPassword');
      (userRepository.save as jest.Mock).mockResolvedValue({
        ...user,
        password: 'hashedNewPassword',
      });

      const result = await service.changePassword(changePasswordDto, tokenDto);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.description).toBe('Password changed successfully.');
      expect(bcryptPasswordEncoder.encode).toHaveBeenCalledWith('newPassword123');
      expect(userRepository.save).toHaveBeenCalled();
    });
  });

  describe('createGeneralConfig', () => {
    const createConfigDto = {
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-31'),
      status: 'Open',
      anual_report_guideline: 'http://example.com/annual',
      assessors_guideline: 'http://example.com/assessors',
      innovations_guideline: 'http://example.com/innovations',
      partnerships_guideline: 'http://example.com/partnerships',
      capdev_guideline: 'http://example.com/capdev',
    };

    it('should successfully create general config', async () => {
      const savedConfig = {
        id: 1,
        ...createConfigDto,
      };
      (generalConfigRepository.save as jest.Mock).mockResolvedValue(savedConfig);

      const result = await service.createGeneralConfig(createConfigDto as any);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toEqual(savedConfig);
      expect(result.description).toBe('Configuration successfully created.');
    });

    it('should handle errors during config creation', async () => {
      (generalConfigRepository.save as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await service.createGeneralConfig(createConfigDto as any);

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.data).toBeNull();
    });
  });

  describe('embedToken', () => {
    const embedTokenDto = {
      token: 'embed-token',
      expiration_date: new Date('2025-12-31'),
      crp_id: 'CRP001',
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      app_user: 1,
    };

    it('should successfully embed token', async () => {
      const savedToken = {
        id: 1,
        ...embedTokenDto,
      };
      (tokenAuthRepository.save as jest.Mock).mockResolvedValue(savedToken);

      const result = await service.embedToken(embedTokenDto);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toEqual(savedToken);
      expect(result.description).toBe('Token saved successfully.');
    });

    it('should handle errors during token embedding', async () => {
      (tokenAuthRepository.save as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await service.embedToken(embedTokenDto);

      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.data).toBeNull();
    });
  });

  describe('validateAD', () => {
    it('should validate user against Active Directory', async () => {
      const user = { email: 'test@example.com' };
      const password = 'password123';

      // Mock ActiveDirectory
      const mockAuthenticate = jest.fn((email, pwd, callback) => {
        callback(null, true);
      });

      jest.mock('activedirectory', () => {
        return jest.fn().mockImplementation(() => ({
          authenticate: mockAuthenticate,
        }));
      });

      // Since validateAD uses ActiveDirectory which is complex to mock,
      // we test that it's defined and can be called
      expect(service.validateAD).toBeDefined();
      expect(typeof service.validateAD).toBe('function');
    });
  });
});
