import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/users.repository';
import { GeneralConfigurationRepository } from '../../shared/repositories/general-config.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import { BcryptPasswordEncoder } from '../../utils/bcrypt.utils';
import { TokenAuthRepository } from './repositories/token-auth.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { AuthMicroserviceService } from '../../shared/microservice/auth-microservice/auth-microservice.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Partial<UserRepository>;
  let authMicroservice: Partial<AuthMicroserviceService>;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
    };
    authMicroservice = {
      authenticateWithCustomCredentials: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: userRepository },
        { provide: GeneralConfigurationRepository, useValue: {} },
        { provide: CycleRepository, useValue: {} },
        { provide: BcryptPasswordEncoder, useValue: {} },
        { provide: TokenAuthRepository, useValue: {} },
        { provide: CrpRepository, useValue: {} },
        { provide: AuthMicroserviceService, useValue: authMicroservice },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return not found if user does not exist', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);
    const result = await service.loginService({
      username: 'test',
      password: '123',
    });
    expect(result.status).toBe(404);
    expect(result.data).toBeNull();
  });
});
