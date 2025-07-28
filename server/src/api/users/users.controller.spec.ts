import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOneById: jest.fn(),
    createUser: jest.fn(),
    editUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: UserRepository, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list all users', async () => {
    mockUsersService.findAll.mockResolvedValue(['user1', 'user2']);
    const result = await controller.listAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(['user1', 'user2']);
  });

  it('should get one user by id', async () => {
    mockUsersService.findOneById.mockResolvedValue({ id: 1, username: 'test' });
    const result = await controller.getOneById(1);
    expect(service.findOneById).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, username: 'test' });
  });

  it('should create a new user', async () => {
    const dto = { username: 'new', password: 'pass' };
    mockUsersService.createUser.mockResolvedValue({ id: 1, username: 'new' });
    const result = await controller.newUser(dto as any);
    expect(service.createUser).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, username: 'new' });
  });

  it('should edit a user', async () => {
    const dto = { username: 'edit' };
    mockUsersService.editUser.mockResolvedValue({ id: 1, username: 'edit' });
    const result = await controller.editUser(1, dto as any);
    expect(service.editUser).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual({ id: 1, username: 'edit' });
  });

  it('should delete a user', async () => {
    mockUsersService.deleteUser.mockResolvedValue({ success: true });
    const result = await controller.deleteUser(1);
    expect(service.deleteUser).toHaveBeenCalledWith(1);
    expect(result).toEqual({ success: true });
  });
});
