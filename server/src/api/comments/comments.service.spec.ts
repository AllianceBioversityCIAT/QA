import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { BatchesRepository } from '../../shared/repositories/batch.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import { EvaluationRepository } from '../evaluations/repositories/evaluation.repository';
import { IndicatorsRepository } from '../indicators/repositories/indicators.repository';
import { UserRepository } from '../users/users.repository';
import { CommentsMetaRepository } from './repositories/comments-meta.repository';
import { CommentsRepository } from './repositories/comments.repository';
import { QuickCommentsRepository } from './repositories/quick-comments.repository';
import { TagsRepository } from './repositories/tags.repository';

describe('CommentsService', () => {
  let service: CommentsService;

  const mockCommentsRepository = {
    getAllComments: jest.fn(),
    getCommentsByCrpId: jest.fn(),
    getRawCommentsData: jest.fn(),
    getRawCommentsExcel: jest.fn(),
    getExcelComments: jest.fn(),
    fetchCommentsByCRP: jest.fn(),
    fetchCommentsByEvaluation: jest.fn(),
    query: jest.fn(),
    save: jest.fn(),
    findCommentById: jest.fn(),
    saveComment: jest.fn(),
    findBatchesOrderedByName: jest.fn(),
    find: jest.fn(),
  };
  const mockEvaluationsRepository = {
    groupBy: jest.fn(),
    findOne: jest.fn(),
  };
  const mockIndicatorsRepository = {
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    }),
  };
  const mockCommentsMetaRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockUsersRepository = {
    findOneOrFail: jest.fn(),
    findOne: jest.fn(),
  };
  const mockTagsRepository = {
    fetchTagsByCRP: jest.fn(),
    fetchAllTags: jest.fn(),
    fetchFeedTagsByIndicatorAndTagType: jest.fn(),
    fetchFeedTagsByIndicator: jest.fn(),
    fetchAllFeedTags: jest.fn(),
  };
  const mockCycleRepository = {
    getAllCycles: jest.fn(),
    getCurrentCycle: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    }),
    findCycleById: jest.fn(),
    updateCycle: jest.fn(),
  };
  const mockBatchesRepository = {
    findBatchesOrderedByName: jest.fn(),
  };
  const mockQuickCommentsRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: CommentsRepository, useValue: mockCommentsRepository },
        { provide: IndicatorsRepository, useValue: mockIndicatorsRepository },
        {
          provide: CommentsMetaRepository,
          useValue: mockCommentsMetaRepository,
        },
        { provide: UserRepository, useValue: mockUsersRepository },
        { provide: TagsRepository, useValue: mockTagsRepository },
        { provide: CycleRepository, useValue: mockCycleRepository },
        { provide: EvaluationRepository, useValue: mockEvaluationsRepository },
        { provide: BatchesRepository, useValue: mockBatchesRepository },
        {
          provide: QuickCommentsRepository,
          useValue: mockQuickCommentsRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getCommentsCount should return grouped data', async () => {
    mockCommentsRepository.getAllComments.mockResolvedValue([
      { indicator_view_name: 'A' },
    ]);
    mockEvaluationsRepository.groupBy.mockReturnValue({ A: [{}] });
    const result = await service.getCommentsCount();
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('A');
  });

  it('getRawCommentsData should return raw data', async () => {
    mockCommentsRepository.getRawCommentsData.mockResolvedValue([{ id: 1 }]);
    const result = await service.getRawCommentsData('crp1');
    expect(result.status).toBe(200);
    expect(result.data[0].id).toBe(1);
  });

  it('getRawCommentsExcel should return excel data', async () => {
    mockCommentsRepository.getRawCommentsExcel.mockResolvedValue([{ id: 1 }]);
    const result = await service.getRawCommentsExcel('crp1');
    expect(result.status).toBe(200);
    expect(result.data[0].id).toBe(1);
  });

  it('getExcelComments should return excel comments', async () => {
    mockCommentsRepository.getExcelComments.mockResolvedValue([{ id: 1 }]);
    const result = await service.getExcelComments('crp1');
    expect(result.status).toBe(200);
    expect(result.data[0].id).toBe(1);
  });

  it('getQuickComments should return quick comments', async () => {
    mockQuickCommentsRepository.find.mockResolvedValue([{ id: 1 }]);
    const result = await service.getQuickComments();
    expect(result.status).toBe(200);
    expect(result.data[0].id).toBe(1);
  });

  it('getBatches should return batches', async () => {
    mockBatchesRepository.findBatchesOrderedByName.mockResolvedValue([
      { id: 1 },
    ]);
    const result = await service.getBatches();
    expect(result.status).toBe(200);
    expect(result.data[0].id).toBe(1);
  });

  it('getCycles should return cycles', async () => {
    mockCycleRepository.getAllCycles.mockResolvedValue([{ id: 1 }]);
    const result = await service.getCycles();
    expect(result.status).toBe(200);
    expect(result.data[0].id).toBe(1);
  });

  it('getActualCycle should return current cycle', async () => {
    mockCycleRepository.getCurrentCycle.mockResolvedValue({ id: 1 });
    const result = await service.getActualCycle();
    expect(result.status).toBe(200);
    expect(result.data.id).toBe(1);
  });
});
