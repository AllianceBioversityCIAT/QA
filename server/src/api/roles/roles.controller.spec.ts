import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { UserRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        { provide: RolesService, useValue: mockRolesService },
        { provide: UserRepository, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new role', async () => {
    mockRolesService.create.mockResolvedValue('created');
    const dto = { description: 'role', acronym: 'R', is_active: true, permissions: [1] };
    const result = await controller.create(dto as any);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBe('created');
  });

  it('should get all roles', async () => {
    mockRolesService.findAll.mockResolvedValue(['role1']);
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(['role1']);
  });

  it('should update a role', async () => {
    mockRolesService.update.mockResolvedValue('updated');
    const dto = { description: 'updated' };
    const result = await controller.update('1', dto as any);
    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(result).toBe('updated');
  });

  it('should delete a role', async () => {
    mockRolesService.remove.mockResolvedValue('deleted');
    const result = await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toBe('deleted');
  });
});
