import { Test, TestingModule } from '@nestjs/testing';
import { IndicatorsController } from './indicators.controller';
import { IndicatorsService } from './indicators.service';
import { UserRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';

describe('IndicatorsController', () => {
  let controller: IndicatorsController;
  let service: IndicatorsService;

  const mockIndicatorsService = {
    create: jest.fn(),
    assignIndicatorToUser: jest.fn(),
    findAll: jest.fn(),
    editIndicators: jest.fn(),
    remove: jest.fn(),
    getIndicatorsByUser: jest.fn(),
    getItemStatusByIndicator: jest.fn(),
    getAllItemStatuses: jest.fn(),
    getItemListStatusMIS: jest.fn(),
    getItemStatusMIS: jest.fn(),
    getCRP: jest.fn(),
    getActionAreas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndicatorsController],
      providers: [
        { provide: IndicatorsService, useValue: mockIndicatorsService },
        { provide: UserRepository, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<IndicatorsController>(IndicatorsController);
    service = module.get<IndicatorsService>(IndicatorsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new indicator', async () => {
    mockIndicatorsService.create.mockResolvedValue('created');
    const dto = { name: 'indicator' };
    const result = await controller.create(dto as any);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBe('created');
  });

  it('should assign indicator to user', async () => {
    mockIndicatorsService.assignIndicatorToUser.mockResolvedValue('assigned');
    const dto = { indicatorId: 1, userId: 2 };
    const result = await controller.assignIndicatorToUser(dto as any);
    expect(service.assignIndicatorToUser).toHaveBeenCalledWith(dto);
    expect(result).toBe('assigned');
  });

  it('should get all active indicators', async () => {
    mockIndicatorsService.findAll.mockResolvedValue(['indicator1']);
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(['indicator1']);
  });

  it('should update an indicator', async () => {
    mockIndicatorsService.editIndicators.mockResolvedValue('updated');
    const dto = { enabled: true };
    const result = await controller.update('1', dto as any);
    expect(service.editIndicators).toHaveBeenCalledWith(1, dto);
    expect(result).toBe('updated');
  });

  it('should delete an indicator', async () => {
    mockIndicatorsService.remove.mockResolvedValue('deleted');
    const result = await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toBe('deleted');
  });

  it('should get indicators by user', async () => {
    mockIndicatorsService.getIndicatorsByUser.mockResolvedValue(['indicator']);
    const result = await controller.getIndicatorsByUser(1, 'crp1');
    expect(service.getIndicatorsByUser).toHaveBeenCalledWith(1, 'crp1');
    expect(result).toEqual(['indicator']);
  });

  it('should get item status by indicator', async () => {
    mockIndicatorsService.getItemStatusByIndicator.mockResolvedValue('status');
    const res = { send: jest.fn() } as any;
    const result = await controller.getItemStatusByIndicator(
      res,
      'indicator',
      'crp1',
    );
    expect(service.getItemStatusByIndicator).toHaveBeenCalledWith(
      res,
      'indicator',
      'crp1',
    );
    expect(result).toBe('status');
  });

  it('should get all item statuses by indicator', async () => {
    mockIndicatorsService.getAllItemStatuses.mockResolvedValue(['status']);
    const result = await controller.getAllItemStatusByIndicator();
    expect(service.getAllItemStatuses).toHaveBeenCalled();
    expect(result).toEqual(['status']);
  });

  it('should get item list status MIS', async () => {
    mockIndicatorsService.getItemListStatusMIS.mockResolvedValue('list');
    const result = await controller.getItemListStatusMIS('1', 'crp1', 2024);
    expect(service.getItemListStatusMIS).toHaveBeenCalledWith(1, 'crp1', 2024);
    expect(result).toBe('list');
  });

  it('should get item status MIS', async () => {
    mockIndicatorsService.getItemStatusMIS.mockResolvedValue('item');
    const result = await controller.getItemStatusMIS(
      '1',
      'crp1',
      'item1',
      2024,
    );
    expect(service.getItemStatusMIS).toHaveBeenCalledWith(
      1,
      'crp1',
      'item1',
      2024,
    );
    expect(result).toBe('item');
  });

  it('should get CRP data', async () => {
    mockIndicatorsService.getCRP.mockResolvedValue('crp');
    const result = await controller.getCRP('crp1');
    expect(service.getCRP).toHaveBeenCalledWith('crp1');
    expect(result).toBe('crp');
  });

  it('should get action areas', async () => {
    mockIndicatorsService.getActionAreas.mockResolvedValue(['area1']);
    const result = await controller.actionAreas();
    expect(service.getActionAreas).toHaveBeenCalled();
    expect(result).toEqual(['area1']);
  });
});
