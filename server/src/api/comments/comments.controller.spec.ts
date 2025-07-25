import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { UserRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockCommentsService = {
    getCommentsCount: jest.fn(),
    createCommentsMeta: jest.fn(),
    getCommentsExcel: jest.fn(),
    getAllIndicatorTags: jest.fn(),
    getFeedTags: jest.fn(),
    toggleApprovedNoComments: jest.fn(),
    getRawCommentsExcel: jest.fn(),
    getRawCommentsData: jest.fn(),
    getCycles: jest.fn(),
    getActualCycle: jest.fn(),
    updateCycle: jest.fn(),
    patchPpuChanges: jest.fn(),
    getBatches: jest.fn(),
    getQuickComments: jest.fn(),
    getExcelComments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        { provide: CommentsService, useValue: mockCommentsService },
        { provide: UserRepository, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getCommentsCount', async () => {
    mockCommentsService.getCommentsCount.mockResolvedValue('result');
    const result = await controller.getCommentsCount('crp1');
    expect(service.getCommentsCount).toHaveBeenCalledWith('crp1');
    expect(result).toBe('result');
  });

  it('should call createCommentsMeta', async () => {
    mockCommentsService.createCommentsMeta.mockResolvedValue('meta');
    const result = await controller.createcommentsMeta();
    expect(service.createCommentsMeta).toHaveBeenCalled();
    expect(result).toBe('meta');
  });

  it('should call getCommentsExcel', async () => {
    mockCommentsService.getCommentsExcel.mockResolvedValue('excel');
    const result = await controller.getCommentsExcel('eval1', {
      userId: '1',
      name: '',
      crp_id: '',
      indicatorName: '',
    });
    expect(service.getCommentsExcel).toHaveBeenCalledWith('eval1', {
      userId: '1',
      name: '',
      crp_id: '',
      indicatorName: '',
    });
    expect(result).toBe('excel');
  });

  it('should call getAllIndicatorTags', async () => {
    mockCommentsService.getAllIndicatorTags.mockResolvedValue('tags');
    const result = await controller.getAllIndicatorTags('crp1');
    expect(service.getAllIndicatorTags).toHaveBeenCalledWith('crp1');
    expect(result).toBe('tags');
  });

  it('should call getFeedTags', async () => {
    mockCommentsService.getFeedTags.mockResolvedValue('feedtags');
    // Simula el objeto Response de express
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    await controller.getFeedTags('indicator', 'tagType', res);
    expect(service.getFeedTags).toHaveBeenCalledWith('indicator', 'tagType');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      data: 'feedtags',
      message: 'All new tags ordered by date (desc)',
    });
  });

  it('should call toggleApprovedNoComments', async () => {
    mockCommentsService.toggleApprovedNoComments.mockResolvedValue('toggled');
    const dto = { some: 'data' };
    const result = await controller.toggleApprovedNoComments(1, dto as any);
    expect(service.toggleApprovedNoComments).toHaveBeenCalledWith(1, dto);
    expect(result).toBe('toggled');
  });

  it('should call getRawCommentsExcel', async () => {
    mockCommentsService.getRawCommentsExcel.mockResolvedValue('rawExcel');
    const result = await controller.getRawCommentsExcel('crp1');
    expect(service.getRawCommentsExcel).toHaveBeenCalledWith('crp1');
    expect(result).toBe('rawExcel');
  });

  it('should call getRawCommentsData', async () => {
    mockCommentsService.getRawCommentsData.mockResolvedValue('rawData');
    const result = await controller.getRawCommentsData('crp1');
    expect(service.getRawCommentsData).toHaveBeenCalledWith('crp1');
    expect(result).toBe('rawData');
  });

  it('should call getCycles', async () => {
    mockCommentsService.getCycles.mockResolvedValue('cycles');
    const result = await controller.getCycles();
    expect(service.getCycles).toHaveBeenCalled();
    expect(result).toBe('cycles');
  });

  it('should call getActualCycle', async () => {
    mockCommentsService.getActualCycle.mockResolvedValue('actualCycle');
    const result = await controller.getActualCycle();
    expect(service.getActualCycle).toHaveBeenCalled();
    expect(result).toBe('actualCycle');
  });

  it('should call updateCycle', async () => {
    mockCommentsService.updateCycle.mockResolvedValue('updated');
    const dto = { id: 1, start_date: new Date(), end_date: new Date() };
    const result = await controller.updateCycle(dto as any);
    expect(service.updateCycle).toHaveBeenCalledWith(
      dto.id,
      dto.start_date,
      dto.end_date,
    );
    expect(result).toBe('updated');
  });

  it('should call patchPpuChanges', async () => {
    mockCommentsService.patchPpuChanges.mockResolvedValue('patched');
    const dto = { ppu: true, commentReplyId: 1 };
    const result = await controller.patchPpuChanges(dto as any);
    expect(service.patchPpuChanges).toHaveBeenCalledWith(
      dto.ppu,
      dto.commentReplyId,
    );
    expect(result).toBe('patched');
  });

  it('should call getBatches', async () => {
    mockCommentsService.getBatches.mockResolvedValue('batches');
    const result = await controller.getBatches();
    expect(service.getBatches).toHaveBeenCalled();
    expect(result).toBe('batches');
  });

  it('should call getQuickComments', async () => {
    mockCommentsService.getQuickComments.mockResolvedValue('quick');
    const result = await controller.getQuickComments();
    expect(service.getQuickComments).toHaveBeenCalled();
    expect(result).toBe('quick');
  });

  it('should call getExcelComments', async () => {
    mockCommentsService.getExcelComments.mockResolvedValue('excelComments');
    const result = await controller.getExcelComments('crp1');
    expect(service.getExcelComments).toHaveBeenCalledWith('crp1');
    expect(result).toBe('excelComments');
  });
});
