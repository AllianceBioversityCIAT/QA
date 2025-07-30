import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    loginService: jest.fn(),
    validateAuthCode: jest.fn(),
    completePasswordChallenge: jest.fn(),
    tokenLoginService: jest.fn(),
    changePassword: jest.fn(),
    createGeneralConfig: jest.fn(),
    embedToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserRepository, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call loginService on login', async () => {
    const dto = { username: 'test', password: '123' };
    mockAuthService.loginService.mockResolvedValue('loginResult');
    const result = await controller.login(dto as any);
    expect(authService.loginService).toHaveBeenCalledWith(dto);
    expect(result).toBe('loginResult');
  });

  it('should call validateAuthCode', async () => {
    const dto = { code: 'abc' };
    mockAuthService.validateAuthCode.mockResolvedValue('validateResult');
    const result = await controller.validateAuthCode(dto);
    expect(authService.validateAuthCode).toHaveBeenCalledWith(dto);
    expect(result).toBe('validateResult');
  });

  it('should call completePasswordChallenge', async () => {
    const dto = { username: 'test', newPassword: 'pass', session: 'sess' };
    mockAuthService.completePasswordChallenge.mockResolvedValue(
      'challengeResult',
    );
    const result = await controller.completePasswordChallenge(dto);
    expect(authService.completePasswordChallenge).toHaveBeenCalledWith(dto);
    expect(result).toBe('challengeResult');
  });

  it('should call tokenLoginService', async () => {
    const dto = { crp_id: 'crp', token: 'tok' };
    mockAuthService.tokenLoginService.mockResolvedValue('tokenLoginResult');
    const result = await controller.tokenLogin(dto as any);
    expect(authService.tokenLoginService).toHaveBeenCalledWith(dto);
    expect(result).toBe('tokenLoginResult');
  });

  it('should call changePassword', async () => {
    const dto = { oldPassword: 'old', newPassword: 'new' };
    const user = { userId: 1 };
    mockAuthService.changePassword.mockResolvedValue('changeResult');
    const result = await controller.changePassword(dto as any, user as any);
    expect(authService.changePassword).toHaveBeenCalledWith(dto, user);
    expect(result).toBe('changeResult');
  });

  it('should call createGeneralConfig', async () => {
    const dto = {
      start_date: new Date(),
      end_date: new Date(),
      status: 'active',
    };
    mockAuthService.createGeneralConfig.mockResolvedValue('configResult');
    const result = await controller.createConfig(dto as any);
    expect(authService.createGeneralConfig).toHaveBeenCalledWith(dto);
    expect(result).toBe('configResult');
  });

  it('should call embedToken', async () => {
    const dto = {
      token: 'tok',
      expiration_date: new Date(),
      crp_id: 'crp',
      username: 'user',
      email: 'mail',
      name: 'name',
      app_user: true,
    };
    mockAuthService.embedToken.mockResolvedValue('embedResult');
    const result = await controller.embedToken(dto as any);
    expect(authService.embedToken).toHaveBeenCalledWith(dto);
    expect(result).toBe('embedResult');
  });
});
