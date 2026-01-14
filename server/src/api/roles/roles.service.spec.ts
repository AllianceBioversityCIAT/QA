import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from '../auth/repositories/permission.repository';

describe('RolesService', () => {
  let service: RolesService;

  const mockRoleRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOneOrFail: jest.fn(),
    remove: jest.fn(),
  };

  const mockPermissionRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RoleRepository, useValue: mockRoleRepository },
        {
          provide: PermissionRepository,
          useValue: mockPermissionRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
