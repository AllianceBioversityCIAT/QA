import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './users.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { BcryptPasswordEncoder } from '../../utils/bcrypt.utils';
import { ResponseUtils } from '../../utils/response.utils';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: any;
  let mockCrpRepository: any;
  let mockRoleRepository: any;
  let mockBcrypt: any;

  beforeEach(async () => {
    mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    mockCrpRepository = { findOne: jest.fn() };
    mockRoleRepository = { find: jest.fn() };
    mockBcrypt = { encode: jest.fn().mockReturnValue('hashed') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: CrpRepository, useValue: mockCrpRepository },
        { provide: RoleRepository, useValue: mockRoleRepository },
        { provide: BcryptPasswordEncoder, useValue: mockBcrypt },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return users', async () => {
    mockUserRepository.find.mockResolvedValue([{ id: 1 }]);
    const result = await service.findAll();
    expect(result.status).toBe(200);
    expect(result.data[0].id).toBe(1);
  });

  it('findAll should handle error', async () => {
    mockUserRepository.find.mockRejectedValue(new Error('fail'));
    const result = await service.findAll();
    expect(result.status).toBe(404);
    expect(result.data).toBeNull();
  });

  it('findOneById should return user', async () => {
    mockUserRepository.findOne.mockResolvedValue({
      id: 1,
      password: 'secret',
      roles: {},
      crp: {},
      crps: {},
    });
    const result = await service.findOneById(1);
    expect(result.status).toBe(200);
    expect(result.data.id).toBe(1);
    expect(result.data.password).toBeUndefined();
  });

  it('findOneById should handle error', async () => {
    mockUserRepository.findOne.mockRejectedValue(new Error('fail'));
    const result = await service.findOneById(1);
    expect(result.status).toBe(404);
    expect(result.data).toBeNull();
  });

  it('createUser should return roles not found', async () => {
    mockRoleRepository.find.mockResolvedValue([]);
    const dto = {
      username: 'a',
      password: 'b',
      roles: [1],
      name: 'n',
      email: 'e',
      crpId: 1,
      is_marlo: false,
    };
    const result = await service.createUser(dto as any);
    expect(result.status).toBe(404);
    expect(result.description).toBe('Roles not found.');
  });

  it('createUser should return CRP does not exist', async () => {
    mockRoleRepository.find.mockResolvedValue([{}]);
    mockCrpRepository.findOne.mockResolvedValue(null);
    const dto = {
      username: 'a',
      password: 'b',
      roles: [1],
      name: 'n',
      email: 'e',
      crpId: 1,
      is_marlo: false,
    };
    const result = await service.createUser(dto as any);
    expect(result.status).toBe(404);
    expect(result.description).toBe('CRP does not exist.');
  });

  it('createUser should return user created', async () => {
    mockRoleRepository.find.mockResolvedValue([{}]);
    mockCrpRepository.findOne.mockResolvedValue({});
    mockUserRepository.save.mockResolvedValue({});
    const dto = {
      username: 'a',
      password: 'b',
      roles: [1],
      name: 'n',
      email: 'e',
      crpId: 1,
      is_marlo: false,
    };
    const result = await service.createUser(dto as any);
    expect(result.status).toBe(200);
    expect(result.description).toBe('User created successfully.');
  });

  it('createUser should handle duplicate username', async () => {
    mockRoleRepository.find.mockResolvedValue([{}]);
    mockCrpRepository.findOne.mockResolvedValue({});
    mockUserRepository.save.mockRejectedValue(new Error('fail'));
    const dto = {
      username: 'a',
      password: 'b',
      roles: [1],
      name: 'n',
      email: 'e',
      crpId: 1,
      is_marlo: false,
    };
    const result = await service.createUser(dto as any);
    expect(result.status).toBe(409);
    expect(result.description).toBe('Username already in use.');
  });

  it('editUser should return user updated', async () => {
    mockUserRepository.findOne.mockResolvedValue({ id: 1 });
    mockRoleRepository.find.mockResolvedValue([{}]);
    mockUserRepository.save.mockResolvedValue({});
    const dto = { username: 'a', roles: [1], name: 'n', email: 'e' };
    const result = await service.editUser(1, dto as any);
    expect(result.status).toBe(200);
    expect(result.description).toBe('User updated successfully.');
  });

  it('editUser should handle user not found', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    const dto = { username: 'a', roles: [1], name: 'n', email: 'e' };
    const result = await service.editUser(1, dto as any);
    expect(result.status).toBe(404);
    expect(result.description).toBe('User not found.');
  });

  it('editUser should handle roles not found', async () => {
    mockUserRepository.findOne.mockResolvedValue({ id: 1 });
    mockRoleRepository.find.mockResolvedValue([]);
    const dto = { username: 'a', roles: [1], name: 'n', email: 'e' };
    const result = await service.editUser(1, dto as any);
    expect(result.status).toBe(404);
    expect(result.description).toBe('Roles not found.');
  });

  it('editUser should handle duplicate username/email', async () => {
    mockUserRepository.findOne.mockResolvedValue({ id: 1 });
    mockRoleRepository.find.mockResolvedValue([{}]);
    mockUserRepository.save.mockRejectedValue(new Error('fail'));
    const dto = { username: 'a', roles: [1], name: 'n', email: 'e' };
    const result = await service.editUser(1, dto as any);
    expect(result.status).toBe(409);
    expect(result.description).toBe('Username or email already in use.');
  });

  it('deleteUser should return user deleted', async () => {
    mockUserRepository.findOne.mockResolvedValue({ id: 1 });
    mockUserRepository.save.mockResolvedValue({});
    const result = await service.deleteUser(1);
    expect(result.status).toBe(200);
    expect(result.description).toBe('User deleted successfully.');
  });

  it('deleteUser should handle user not found', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    const result = await service.deleteUser(1);
    expect(result.status).toBe(404);
    expect(result.description).toBe('User not found.');
  });

  it('deleteUser should handle error', async () => {
    mockUserRepository.findOne.mockResolvedValue({ id: 1 });
    mockUserRepository.save.mockRejectedValue(new Error('fail'));
    const result = await service.deleteUser(1);
    expect(result.status).toBe(500);
    expect(result.description).toBe('Failed to delete user.');
  });
});
