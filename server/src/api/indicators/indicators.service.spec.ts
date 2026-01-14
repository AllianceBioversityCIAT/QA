import { Test, TestingModule } from '@nestjs/testing';
import { IndicatorsService } from './indicators.service';
import { IndicatorsRepository } from './repositories/indicators.repository';
import { UserRepository } from '../users/users.repository';
import { IndicatorUsersRepository } from './repositories/indicators-users.repository';
import { EvaluationRepository } from '../evaluations/repositories/evaluation.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { CommentsMetaRepository } from '../comments/repositories/comments-meta.repository';

describe('IndicatorsService', () => {
  let service: IndicatorsService;

  const mockIndicatorsRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOneOrFail: jest.fn(),
    delete: jest.fn(),
    query: jest.fn(),
    createMetaForIndicator: jest.fn(),
    getAdminIndicators: jest.fn(),
    getCRPIndicators: jest.fn(),
    getUserIndicators: jest.fn(),
    getAllItemStatusByIndicator: jest.fn(),
    getItemListStatusMIS: jest.fn(),
    getItemStatusMIS: jest.fn(),
    getActionAreas: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    }),
  };

  const mockUserRepository = {
    findOneOrFail: jest.fn(),
    findOne: jest.fn(),
  };

  const mockIndicatorUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    }),
  };

  const mockEvaluationRepository = {
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    }),
  };

  const mockCrpRepository = {
    findOne: jest.fn(),
  };

  const mockCommentsMetaRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndicatorsService,
        { provide: IndicatorsRepository, useValue: mockIndicatorsRepository },
        { provide: UserRepository, useValue: mockUserRepository },
        {
          provide: IndicatorUsersRepository,
          useValue: mockIndicatorUserRepository,
        },
        {
          provide: EvaluationRepository,
          useValue: mockEvaluationRepository,
        },
        { provide: CrpRepository, useValue: mockCrpRepository },
        {
          provide: CommentsMetaRepository,
          useValue: mockCommentsMetaRepository,
        },
      ],
    }).compile();

    service = module.get<IndicatorsService>(IndicatorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
