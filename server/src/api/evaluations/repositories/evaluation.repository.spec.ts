import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { EvaluationRepository } from './evaluation.repository';
import { Evaluations } from '../entities/evaluation.entity';
import { Users } from '../../users/entities/user.entity';
import { Comments } from '../../comments/entities/comments.entity';
import { IndicatorsMeta } from '../../indicators/entities/indicators-meta.entity';
import { Cycle } from '../../../shared/entities/cycle.entity';
import { StatusHandler } from '../enum/status-handler.enum';
import { DisplayTypeHandler } from '../enum/display-handler.enum';

describe('EvaluationRepository', () => {
  let repository: EvaluationRepository;
  let dataSource: jest.Mocked<DataSource>;
  let mockQuery: jest.Mock;
  let mockQueryRunner: any;
  let mockUserRepository: jest.Mocked<Repository<Users>>;
  let mockCommentRepository: jest.Mocked<Repository<Comments>>;
  let mockMetaRepository: jest.Mocked<Repository<IndicatorsMeta>>;
  let mockCycleRepository: jest.Mocked<Repository<Cycle>>;

  beforeEach(async () => {
    mockQuery = jest.fn();
    
    const mockGetRawOne = jest.fn();
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: mockGetRawOne,
    };

    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      query: jest.fn(),
      connection: {
        query: jest.fn(),
        driver: {
          escapeQueryWithParameters: jest.fn().mockReturnValue(['query', []]),
        },
      },
    };

    mockUserRepository = {
      findOneOrFail: jest.fn(),
    } as any;

    mockCommentRepository = {
      save: jest.fn(),
    } as any;

    mockMetaRepository = {
      findOneOrFail: jest.fn(),
    } as any;

    mockCycleRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    } as any;

    const mockEscapeQuery = jest.fn().mockReturnValue(['query', []]);

    dataSource = {
      createEntityManager: jest.fn().mockReturnValue({}),
      query: mockQuery,
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      getRepository: jest.fn((entity) => {
        if (entity === Users) return mockUserRepository;
        if (entity === Comments) return mockCommentRepository;
        if (entity === IndicatorsMeta) return mockMetaRepository;
        if (entity === Cycle) return mockCycleRepository;
        return {};
      }),
      driver: {
        escapeQueryWithParameters: mockEscapeQuery,
      },
    } as any;

    // Store references for easier access in tests
    (dataSource as any).__mockEscapeQuery = mockEscapeQuery;
    (mockCycleRepository as any).__mockGetRawOne = mockGetRawOne;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationRepository,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    repository = module.get<EvaluationRepository>(EvaluationRepository);

    // Mock the query method from Repository
    jest.spyOn(repository, 'query').mockImplementation(mockQuery);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getUser', () => {
    it('should return undefined when userId is not provided', async () => {
      const result = await repository.getUser(null);
      expect(result).toBeUndefined();
      expect(mockUserRepository.findOneOrFail).not.toHaveBeenCalled();
    });

    it('should return undefined when userId is 0', async () => {
      const result = await repository.getUser(0);
      expect(result).toBeUndefined();
    });

    it('should return user when userId is provided', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser as Users);

      const result = await repository.getUser(1);

      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findOneOrFail.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(repository.getUser(999)).rejects.toThrow();
    });
  });

  describe('getEvaluationsByCrpId', () => {
    it('should return empty array when role is not 1', async () => {
      const result = await repository.getEvaluationsByCrpId('CRP001', 2);
      expect(result).toEqual([]);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should execute query when role is 1', async () => {
      const mockData = [
        {
          crp_id: 'CRP001',
          indicator_view_name: 'qa_policy_change',
          count: 5,
        },
      ];

      (dataSource as any).__mockEscapeQuery.mockReturnValue([
        'escaped query',
        [],
      ]);
      dataSource.query.mockResolvedValue(mockData);

      const result = await repository.getEvaluationsByCrpId('CRP001', 1);

      expect((dataSource as any).__mockEscapeQuery).toHaveBeenCalled();
      expect(dataSource.query).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getAllEvaluations', () => {
    it('should execute query and return all evaluations', async () => {
      const mockData = [
        {
          status: 'pending',
          indicator_view_name: 'qa_policy_change',
          count: 10,
        },
      ];

      (dataSource as any).__mockEscapeQuery.mockReturnValue([
        'escaped query',
        [],
      ]);
      dataSource.query.mockResolvedValue(mockData);

      const result = await repository.getAllEvaluations();

      expect((dataSource as any).__mockEscapeQuery).toHaveBeenCalled();
      expect(dataSource.query).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getEvaluationsAdmin', () => {
    it('should execute query with viewName parameter', async () => {
      const mockData = [
        {
          evaluation_id: 1,
          evaluations_status: 'pending',
          indicator_view_name: 'qa_policy_change',
        },
      ];

      mockQueryRunner.connection.driver.escapeQueryWithParameters.mockReturnValue(
        ['escaped query', []],
      );
      mockQueryRunner.connection.query.mockResolvedValue(mockData);

      const result = await repository.getEvaluationsAdmin('qa_policy_change');

      expect(
        mockQueryRunner.connection.driver.escapeQueryWithParameters,
      ).toHaveBeenCalled();
      expect(mockQueryRunner.connection.query).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getEvaluationsByCrpIdAndView', () => {
    it('should execute query with viewName and crpId parameters', async () => {
      const mockData = [
        {
          evaluation_id: 1,
          initiative: 'CRP001',
          indicator_view_name: 'qa_policy_change',
        },
      ];

      mockQueryRunner.connection.driver.escapeQueryWithParameters.mockReturnValue(
        ['escaped query', []],
      );
      mockQueryRunner.connection.query.mockResolvedValue(mockData);

      const result = await repository.getEvaluationsByCrpIdAndView(
        'qa_policy_change',
        'CRP001',
      );

      expect(
        mockQueryRunner.connection.driver.escapeQueryWithParameters,
      ).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getEvaluationsByIndicator', () => {
    it('should execute query with id and viewName parameters', async () => {
      const mockData = [
        {
          evaluation_id: 1,
          indicator_view_name: 'qa_policy_change',
        },
      ];

      mockQueryRunner.connection.driver.escapeQueryWithParameters.mockReturnValue(
        ['escaped query', []],
      );
      mockQueryRunner.connection.query.mockResolvedValue(mockData);

      const result = await repository.getEvaluationsByIndicator(
        1,
        'qa_policy_change',
      );

      expect(
        mockQueryRunner.connection.driver.escapeQueryWithParameters,
      ).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getEvaluationsDashByCRP', () => {
    it('should execute query and return evaluations dashboard data', async () => {
      const mockData = [
        {
          crp_id: 'CRP001',
          indicator_view_name: 'qa_policy_change',
          evaluations_status: 'complete',
        },
      ];

      mockQueryRunner.connection.driver.escapeQueryWithParameters.mockReturnValue(
        ['escaped query', []],
      );
      mockQueryRunner.connection.query.mockResolvedValue(mockData);

      const result = await repository.getEvaluationsDashByCRP('CRP001');

      expect(mockQueryRunner.connection.query).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getAllEvaluationsDash', () => {
    it('should execute query and return all evaluations dashboard data', async () => {
      const mockData = [
        {
          status: 'pending',
          indicator_view_name: 'qa_policy_change',
          count: 5,
        },
      ];

      mockQueryRunner.connection.driver.escapeQueryWithParameters.mockReturnValue(
        ['escaped query', []],
      );
      mockQueryRunner.connection.query.mockResolvedValue(mockData);

      const result = await repository.getAllEvaluationsDash();

      expect(mockQueryRunner.connection.query).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getEvaluationsDashByUserId', () => {
    it('should execute query with userId parameter', async () => {
      const mockData = [
        {
          status: 'pending',
          indicator_view_name: 'qa_policy_change',
          count: 3,
        },
      ];

      dataSource.query.mockResolvedValue(mockData);

      const result = await repository.getEvaluationsDashByUserId(1);

      expect(dataSource.query).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getDetailedEvaluationForAdmin', () => {
    it('should execute query with all parameters', async () => {
      const mockData = [
        {
          evaluation_id: 1,
          meta_display_name: 'Field Name',
          value: 'Field Value',
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.getDetailedEvaluationForAdmin(
        1,
        'qa_policy_change',
        'pcd',
        123,
      );

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getDetailedEvaluationForCrp', () => {
    it('should execute query with all parameters', async () => {
      const mockData = [
        {
          evaluation_id: 1,
          meta_display_name: 'Field Name',
          value: 'Field Value',
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.getDetailedEvaluationForCrp(
        1,
        'qa_policy_change',
        'pcd',
        123,
      );

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getDetailedEvaluationForUser', () => {
    it('should execute query with all parameters', async () => {
      const mockData = [
        {
          evaluation_id: 1,
          meta_display_name: 'Field Name',
          value: 'Field Value',
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.getDetailedEvaluationForUser(
        1,
        'qa_policy_change',
        'pcd',
        123,
      );

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('findOneById', () => {
    it('should find evaluation by id', async () => {
      const mockEvaluation = { id: 1, crp_id: 'CRP001' };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(mockEvaluation as Evaluations);

      const result = await repository.findOneById(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockEvaluation);
    });

    it('should return null when evaluation not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.findOneById(999);

      expect(result).toBeNull();
    });
  });

  describe('getMetaIdByViewName', () => {
    it('should return meta id for given view name', async () => {
      const mockData = [{ id: 5 }];

      mockQueryRunner.connection.driver.escapeQueryWithParameters.mockReturnValue(
        ['escaped query', []],
      );
      mockQueryRunner.connection.query.mockResolvedValue(mockData);

      const result = await repository.getMetaIdByViewName('qa_policy_change');

      expect(mockQueryRunner.connection.query).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it('should return null when no meta found', async () => {
      mockQueryRunner.connection.driver.escapeQueryWithParameters.mockReturnValue(
        ['escaped query', []],
      );
      mockQueryRunner.connection.query.mockResolvedValue([]);

      const result = await repository.getMetaIdByViewName('qa_policy_change');

      expect(result).toBeNull();
    });
  });

  describe('getIndicatorsByCrp', () => {
    it('should execute query and return indicators', async () => {
      const mockData = [
        {
          id: 1,
          indicator_view_name: 'qa_policy_change',
          indicator_order: 1,
        },
      ];

      mockQueryRunner.connection.driver.escapeQueryWithParameters.mockReturnValue(
        ['escaped query', []],
      );
      mockQueryRunner.connection.query.mockResolvedValue(mockData);

      const result = await repository.getIndicatorsByCrp();

      expect(mockQueryRunner.connection.query).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('createComment', () => {
    const mockCreateCommentDto = {
      userId: 1,
      evaluationId: 1,
      metaId: 5,
      detail: 'Test comment',
      approved: true,
      require_changes: false,
      tpb: false,
      original_field: 'Original value',
    };

    it('should create comment successfully', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      const mockMeta = { id: 5, display_name: 'Field Name' };
      const mockEvaluation = { id: 1, crp_id: 'CRP001' };
      const mockCycle = { qa_cycle_id: 1 };
      const mockComment = { id: 1, detail: 'Test comment' };

      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser as Users);
      mockMetaRepository.findOneOrFail.mockResolvedValue(mockMeta as any);
      jest
        .spyOn(repository, 'findOneOrFail')
        .mockResolvedValue(mockEvaluation as Evaluations);
      (mockCycleRepository as any).__mockGetRawOne.mockResolvedValue(mockCycle);
      mockCommentRepository.save.mockResolvedValue(mockComment as Comments);

      const result = await repository.createComment(mockCreateCommentDto);

      expect(mockUserRepository.findOneOrFail).toHaveBeenCalled();
      expect(mockMetaRepository.findOneOrFail).toHaveBeenCalled();
      expect(repository.findOneOrFail).toHaveBeenCalled();
      expect(mockCommentRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockComment);
    });

    it('should handle null metaId', async () => {
      const mockUser = { id: 1 };
      const mockEvaluation = { id: 1 };
      const mockCycle = { qa_cycle_id: 1 };
      const mockComment = { id: 1 };

      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser as Users);
      jest
        .spyOn(repository, 'findOneOrFail')
        .mockResolvedValue(mockEvaluation as Evaluations);
      (mockCycleRepository as any).__mockGetRawOne.mockResolvedValue(mockCycle);
      mockCommentRepository.save.mockResolvedValue(mockComment as Comments);

      const dtoWithoutMeta = { ...mockCreateCommentDto, metaId: null };

      const result = await repository.createComment(dtoWithoutMeta);

      expect(mockMetaRepository.findOneOrFail).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should return null when no active cycle found', async () => {
      const mockUser = { id: 1 };
      const mockMeta = { id: 5 };
      const mockEvaluation = { id: 1 };

      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser as Users);
      mockMetaRepository.findOneOrFail.mockResolvedValue(mockMeta as any);
      jest
        .spyOn(repository, 'findOneOrFail')
        .mockResolvedValue(mockEvaluation as Evaluations);
      (mockCycleRepository as any).__mockGetRawOne.mockResolvedValue(null);

      const result = await repository.createComment(mockCreateCommentDto);

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockUserRepository.findOneOrFail.mockRejectedValue(
        new Error('User not found'),
      );

      const result = await repository.createComment(mockCreateCommentDto);

      expect(result).toBeNull();
    });
  });

  describe('findAssessorsR1', () => {
    it('should execute query and return assessors round 1', async () => {
      const mockData = [{ assessed_r1: 'user1, user2' }];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.findAssessorsR1(1);

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('findAssessorsR2', () => {
    it('should execute query and return assessors round 2', async () => {
      const mockData = [{ assessed_r2: 'user1, user2' }];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.findAssessorsR2(1);

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getPendingHighlights', () => {
    it('should execute query and return pending highlights', async () => {
      const mockData = [
        {
          pending_highlight_comments: 5,
          indicator_view_name: 'qa_policy_change',
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.getPendingHighlights();

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getEvaluationStatus', () => {
    it('should execute query and return evaluation status', async () => {
      const mockData = [
        {
          indicator_view_id: 123,
          evaluations_status: 'complete',
        },
      ];

      mockQueryRunner.connection.driver.escapeQueryWithParameters.mockReturnValue(
        ['escaped query', []],
      );
      mockQueryRunner.connection.query.mockResolvedValue(mockData);

      const result = await repository.getEvaluationStatus('123');

      expect(mockQueryRunner.connection.query).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('changedFieldsInitial', () => {
    it('should return changed fields when data exists', async () => {
      const mockData = [{ id: 1, title: 'New Title', version: '1.0' }];
      const mockDataInitial = [{ id: 1, title: 'Old Title', version: '1.0' }];

      mockQuery
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(mockDataInitial);

      const result = await repository.changedFieldsInitial(
        'qa_policy_change',
        1,
      );

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when dataInitial is empty', async () => {
      const mockData = [{ id: 1, title: 'Title' }];

      mockQuery
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce([]);

      const result = await repository.changedFieldsInitial(
        'qa_policy_change',
        1,
      );

      expect(result).toEqual([]);
    });

    it('should throw error on exception', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(
        repository.changedFieldsInitial('qa_policy_change', 1),
      ).rejects.toThrow('Error comparing fields');
    });
  });

  describe('changedFieldsPhase', () => {
    it('should return changed fields when data exists', async () => {
      const mockData = [
        { id: 1, title: 'New Title', result_code: 'PC-001' },
      ];
      const mockDataPrevious = [
        { id: 2, title: 'Old Title', result_code: 'PC-001' },
      ];

      mockQuery
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(mockDataPrevious);

      const result = await repository.changedFieldsPhase('qa_policy_change', 1);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when data is empty', async () => {
      mockQuery.mockResolvedValueOnce([]);

      const result = await repository.changedFieldsPhase('qa_policy_change', 1);

      expect(result).toEqual([]);
    });

    it('should return empty array when dataPreviousPhase is empty', async () => {
      const mockData = [{ id: 1, result_code: 'PC-001' }];

      mockQuery
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce([]);

      const result = await repository.changedFieldsPhase('qa_policy_change', 1);

      expect(result).toEqual([]);
    });

    it('should throw error on exception', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(
        repository.changedFieldsPhase('qa_policy_change', 1),
      ).rejects.toThrow('Error comparing fields');
    });
  });

  describe('compareData', () => {
    it('should return empty array when data is null', () => {
      const result = repository.compareData(null, { field: 'value' });
      expect(result).toEqual([]);
    });

    it('should return empty array when dataInitial is null', () => {
      const result = repository.compareData({ field: 'value' }, null);
      expect(result).toEqual([]);
    });

    it('should return changed fields', () => {
      const data = { id: 1, title: 'New Title', version: '1.0' };
      const dataInitial = { id: 1, title: 'Old Title', version: '1.0' };

      const result = repository.compareData(data, dataInitial);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        field: 'title',
        oldValue: 'Old Title',
        newValue: 'New Title',
      });
    });

    it('should return empty array when no fields changed', () => {
      const data = { id: 1, title: 'Title', version: '1.0' };
      const dataInitial = { id: 1, title: 'Title', version: '1.0' };

      const result = repository.compareData(data, dataInitial);

      expect(result).toEqual([]);
    });

    it('should handle multiple changed fields', () => {
      const data = {
        id: 1,
        title: 'New Title',
        version: '2.0',
        description: 'New Description',
      };
      const dataInitial = {
        id: 1,
        title: 'Old Title',
        version: '1.0',
        description: 'Old Description',
      };

      const result = repository.compareData(data, dataInitial);

      expect(result).toHaveLength(3);
    });
  });

  describe('groupBy', () => {
    it('should group array by key', () => {
      const array = [
        { indicator_view_name: 'qa_policy_change', count: 5 },
        { indicator_view_name: 'qa_policy_change', count: 3 },
        { indicator_view_name: 'qa_innovation_use', count: 2 },
      ];

      const result = repository.groupBy(array, 'indicator_view_name');

      expect(result).toHaveProperty('qa_policy_change');
      expect(result).toHaveProperty('qa_innovation_use');
      expect(result['qa_policy_change']).toHaveLength(2);
      expect(result['qa_innovation_use']).toHaveLength(1);
    });

    it('should return empty object for empty array', () => {
      const result = repository.groupBy([], 'key');
      expect(result).toEqual({});
    });
  });

  describe('getType', () => {
    it('should return "danger" for Pending status', () => {
      const result = repository.getType(StatusHandler.Pending);
      expect(result).toBe('danger');
    });

    it('should return "success" for Complete status', () => {
      const result = repository.getType(StatusHandler.Complete);
      expect(result).toBe('success');
    });

    it('should return "info" for Finalized status', () => {
      const result = repository.getType(StatusHandler.Finalized);
      expect(result).toBe('info');
    });

    it('should return empty string for unknown status', () => {
      const result = repository.getType('unknown' as any);
      expect(result).toBe('');
    });
  });

  describe('parseEvaluationsData', () => {
    it('should parse data when type is not provided', () => {
      const rawData = [
        {
          meta_col_name: 'title',
          title: 'Test Title',
          evaluations_status: 'pending',
        },
      ];

      const result = repository.parseEvaluationsData(rawData);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should parse data when type is provided and meta_is_primary is false', () => {
      const rawData = [
        {
          meta_col_name: 'title',
          title: 'Test Title',
          meta_is_primary: false,
          meta_include_detail: true,
        },
      ];

      const result = repository.parseEvaluationsData(rawData, 'detail');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should skip items when meta_is_primary is true and type is provided', () => {
      const rawData = [
        {
          meta_col_name: 'title',
          title: 'Test Title',
          meta_is_primary: true,
          meta_include_detail: true,
        },
      ];

      const result = repository.parseEvaluationsData(rawData, 'detail');

      expect(result).toHaveLength(0);
    });
  });
});
