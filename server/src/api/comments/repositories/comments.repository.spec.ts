import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { CommentsRepository } from './comments.repository';
import { Comments } from '../entities/comments.entity';
import { Users } from '../../users/entities/user.entity';
import { Evaluations } from '../../evaluations/entities/evaluation.entity';
import { Cycle } from '../../../shared/entities/cycle.entity';

describe('CommentsRepository', () => {
  let repository: CommentsRepository;
  let dataSource: jest.Mocked<DataSource>;
  let mockQuery: jest.Mock;
  let mockQueryRunner: any;

  beforeEach(async () => {
    mockQuery = jest.fn();
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      query: jest.fn(),
      connection: {
        query: jest.fn(),
      },
    };

    dataSource = {
      createEntityManager: jest.fn().mockReturnValue({}),
      query: mockQuery,
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsRepository,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    repository = module.get<CommentsRepository>(CommentsRepository);

    // Mock the query method from Repository
    jest.spyOn(repository, 'query').mockImplementation(mockQuery);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getCommentsCount', () => {
    it('should return grouped data when crpId is provided', async () => {
      const mockData = [
        {
          indicator_view_name: 'qa_policy_change',
          comments_accepted_without_comment: 5,
          comments_rejected: 2,
        },
        {
          indicator_view_name: 'qa_innovation_use',
          comments_accepted_without_comment: 3,
          comments_rejected: 1,
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.getCommentsCount('CRP001', 1);

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should return grouped data when crpId is undefined', async () => {
      const mockData = [
        {
          indicator_view_name: 'qa_policy_change',
          comments_accepted_without_comment: 5,
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.getCommentsCount(undefined, 1);

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should return grouped data when crpId is "undefined" string', async () => {
      const mockData = [];
      mockQuery.mockResolvedValue(mockData);

      const result = await repository.getCommentsCount('undefined', 1);

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error when query fails', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(
        repository.getCommentsCount('CRP001', 1),
      ).rejects.toThrow('Error retrieving comments count');
    });
  });

  describe('getCommentsByCrpId', () => {
    it('should execute query with crpId parameter', async () => {
      const mockData = [
        {
          indicator_view_name: 'qa_policy_change',
          comments_accepted_without_comment: 5,
        },
      ];

      const dataSourceQuerySpy = jest
        .spyOn(dataSource, 'query')
        .mockResolvedValue(mockData);

      const result = await repository.getCommentsByCrpId('CRP001');

      expect(dataSourceQuerySpy).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should return empty array when no data found', async () => {
      jest.spyOn(dataSource, 'query').mockResolvedValue([]);

      const result = await repository.getCommentsByCrpId('CRP001');

      expect(result).toEqual([]);
    });
  });

  describe('getAllComments', () => {
    it('should execute query and return all comments', async () => {
      const mockData = [
        {
          indicator_view_name: 'qa_policy_change',
          comments_accepted_without_comment: 10,
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.getAllComments();

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should return empty array when no comments found', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await repository.getAllComments();

      expect(result).toEqual([]);
    });
  });

  describe('groupByIndicatorViewName', () => {
    it('should group data by indicator_view_name', () => {
      const data = [
        { indicator_view_name: 'qa_policy_change', value: 5 },
        { indicator_view_name: 'qa_policy_change', value: 3 },
        { indicator_view_name: 'qa_innovation_use', value: 2 },
      ];

      const result = repository.groupByIndicatorViewName(data);

      expect(result).toHaveProperty('qa_policy_change');
      expect(result).toHaveProperty('qa_innovation_use');
      expect(result['qa_policy_change']).toHaveLength(2);
      expect(result['qa_innovation_use']).toHaveLength(1);
    });

    it('should return empty object for empty array', () => {
      const result = repository.groupByIndicatorViewName([]);

      expect(result).toEqual({});
    });

    it('should handle null indicator_view_name', () => {
      const data = [
        { indicator_view_name: null, value: 1 },
        { indicator_view_name: 'qa_policy_change', value: 2 },
      ];

      const result = repository.groupByIndicatorViewName(data);

      expect(result).toHaveProperty('null');
      expect(result).toHaveProperty('qa_policy_change');
    });
  });

  describe('fetchCommentsByCRP', () => {
    it('should execute query with crp_id and indicatorName', async () => {
      const mockData = [
        {
          comment_id: 1,
          detail: 'Test comment',
          indicator_title: 'Test Title',
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.fetchCommentsByCRP(
        'CRP001',
        'qa_policy_change',
      );

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should return empty array when no comments found', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await repository.fetchCommentsByCRP(
        'CRP001',
        'qa_policy_change',
      );

      expect(result).toEqual([]);
    });
  });

  describe('fetchCommentsByEvaluation', () => {
    it('should execute query with evaluationId and indicatorName', async () => {
      const mockData = [
        {
          'Evaluation ID': 1,
          'Comment 2023': 'Test comment',
          'Result code': 'PC-001',
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.fetchCommentsByEvaluation(
        '1',
        'qa_policy_change',
      );

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should return empty array when no comments found', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await repository.fetchCommentsByEvaluation(
        '1',
        'qa_policy_change',
      );

      expect(result).toEqual([]);
    });
  });

  describe('findCommentsWithMeta', () => {
    it('should find comments with meta using query builder', async () => {
      const mockComments = [
        {
          id: 1,
          meta: { id: 1 },
          evaluation: 1,
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockComments),
      };

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await repository.findCommentsWithMeta(1, [1, 2]);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'qc.evaluationId = :evaluationId',
        { evaluationId: 1 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'qc.metaId IN (:...meta_array)',
        { meta_array: [1, 2] },
      );
      expect(result).toEqual(mockComments);
    });
  });

  describe('createComment', () => {
    it('should create a new comment instance', () => {
      const user: Partial<Users> = { id: 1 };
      const evaluation: Partial<Evaluations> = { id: 1 };
      const cycle: Partial<Cycle> = { id: 1 };
      const metaId = 5;
      const noComment = true;

      const comment = repository.createComment(
        user as Users,
        evaluation as Evaluations,
        metaId,
        noComment,
        cycle as Cycle,
      );

      expect(comment).toBeInstanceOf(Comments);
      expect(comment.approved).toBe(noComment);
      expect(comment.is_deleted).toBe(!noComment);
      expect(comment.evaluation).toBe(evaluation.id);
      expect(comment.userId).toBe(user.id);
      expect(comment.cycle).toBe(cycle.id);
      expect(comment.detail).toBeNull();
      expect(comment.approved_no_comment).toBe(noComment);
    });

    it('should create comment with is_deleted true when noComment is false', () => {
      const user: Partial<Users> = { id: 1 };
      const evaluation: Partial<Evaluations> = { id: 1 };
      const cycle: Partial<Cycle> = { id: 1 };

      const comment = repository.createComment(
        user as Users,
        evaluation as Evaluations,
        5,
        false,
        cycle as Cycle,
      );

      expect(comment.is_deleted).toBe(true);
      expect(comment.approved).toBe(false);
    });
  });

  describe('getRawCommentsExcel', () => {
    it('should return comments and evaluation data when crp_id is provided', async () => {
      const mockCommentsData = [{ id: 1, detail: 'Comment 1' }];
      const mockEvaluationData = [{ id: 1, crp_id: 'CRP001' }];

      mockQueryRunner.query
        .mockResolvedValueOnce(mockCommentsData)
        .mockResolvedValueOnce(mockEvaluationData);

      const result = await repository.getRawCommentsExcel('CRP001');

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual([mockCommentsData, mockEvaluationData]);
    });

    it('should return comments and evaluation data when crp_id is undefined', async () => {
      const mockCommentsData = [{ id: 1 }];
      const mockEvaluationData = [{ id: 1 }];

      mockQueryRunner.connection.query
        .mockResolvedValueOnce(mockCommentsData)
        .mockResolvedValueOnce(mockEvaluationData);

      const result = await repository.getRawCommentsExcel(undefined);

      expect(mockQueryRunner.connection.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual([mockCommentsData, mockEvaluationData]);
    });

    it('should handle errors and throw', async () => {
      mockQueryRunner.connect.mockRejectedValue(new Error('Connection error'));

      await expect(
        repository.getRawCommentsExcel('CRP001'),
      ).rejects.toThrow();
    });
  });

  describe('getRawCommentsData', () => {
    it('should execute query with crp_id when provided', async () => {
      const mockData = [
        {
          comment_id: 1,
          crp_acronym: 'CRP',
          indicator_view_name: 'qa_policy_change',
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.getRawCommentsData('CRP001');

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should execute query without crp_id when not provided', async () => {
      const mockData = [{ comment_id: 1 }];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.getRawCommentsData();

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('findOneById', () => {
    it('should find comment by id', async () => {
      const mockComment = { id: 1, detail: 'Test comment' };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockComment as Comments);

      const result = await repository.findOneById(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockComment);
    });

    it('should return null when comment not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.findOneById(999);

      expect(result).toBeNull();
    });
  });

  describe('findCommentById', () => {
    it('should find comment or fail by id', async () => {
      const mockComment = { id: 1, detail: 'Test comment' };

      jest
        .spyOn(repository, 'findOneOrFail')
        .mockResolvedValue(mockComment as Comments);

      const result = await repository.findCommentById(1);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockComment);
    });

    it('should throw error when comment not found', async () => {
      jest
        .spyOn(repository, 'findOneOrFail')
        .mockRejectedValue(new Error('Comment not found'));

      await expect(repository.findCommentById(999)).rejects.toThrow();
    });
  });

  describe('saveComment', () => {
    it('should save a comment', async () => {
      const comment = new Comments();
      comment.id = 1;
      comment.detail = 'Test comment';

      const savedComment = { ...comment, id: 1 };

      jest.spyOn(repository, 'save').mockResolvedValue(savedComment as Comments);

      const result = await repository.saveComment(comment);

      expect(repository.save).toHaveBeenCalledWith(comment);
      expect(result).toEqual(savedComment);
    });
  });

  describe('getExcelComments', () => {
    it('should execute query and return excel comments', async () => {
      const mockData = [
        {
          'Comment ID': 1,
          'Assessor comment': 'Test comment',
          'Status': 'Accepted',
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.getExcelComments('CRP001');

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should throw error when query fails', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(repository.getExcelComments('CRP001')).rejects.toThrow(
        'Error retrieving comments',
      );
    });
  });

  describe('findOneWithTags', () => {
    it('should find comment with tags relation', async () => {
      const mockComment = {
        id: 1,
        detail: 'Test comment',
        tags: [{ id: 1, name: 'tag1' }],
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockComment as any);

      const result = await repository.findOneWithTags(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { tags: true },
      });
      expect(result).toEqual(mockComment);
    });

    it('should return null when comment not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.findOneWithTags(999);

      expect(result).toBeNull();
    });
  });

  describe('findCommentsWithReplies', () => {
    it('should execute query and return comments with replies count', async () => {
      const mockData = [
        {
          id: 1,
          replies_count: 3,
          highlight_by: 'user1',
          highlight_comment: 1,
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.findCommentsWithReplies(1, 5);

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should return empty array when no comments found', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await repository.findCommentsWithReplies(1, 5);

      expect(result).toEqual([]);
    });
  });

  describe('findComments', () => {
    it('should find comments with metaId and evaluationId', async () => {
      const mockComments = [
        {
          id: 1,
          detail: 'Test comment',
          meta: { id: 5 },
          evaluation: 1,
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(mockComments as any);

      const result = await repository.findComments(5, 1);

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockComments);
    });

    it('should find comments without metaId when metaId is null', async () => {
      const mockComments = [
        {
          id: 1,
          detail: 'Test comment',
          evaluation: 1,
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(mockComments as any);

      const result = await repository.findComments(null, 1);

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockComments);
    });

    it('should handle errors during find', async () => {
      jest
        .spyOn(repository, 'find')
        .mockRejectedValue(new Error('Database error'));

      const result = await repository.findComments(5, 1);

      expect(result).toBeUndefined();
    });
  });

  describe('findTagsByCommentId', () => {
    it('should execute query and return tags for comment', async () => {
      const mockData = [
        {
          tag_id: 1,
          tag_type: 1,
          tag_name: 'Important',
          user_name: 'user1',
          userId: 1,
        },
      ];

      mockQuery.mockResolvedValue(mockData);

      const result = await repository.findTagsByCommentId(1);

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should return empty array when no tags found', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await repository.findTagsByCommentId(1);

      expect(result).toEqual([]);
    });
  });
});
