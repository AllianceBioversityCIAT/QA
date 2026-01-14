import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RolesGuard } from './role.guard';
import { RolesHandler } from '../enum/roles-handler.enum';
import { Roles } from '../decorators/roles.decorator';
import { UserRepository } from '../../api/users/users.repository';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as any;

    userRepository = {
      findOne: jest.fn(),
    } as any;

    jwtService = {
      decode: jest.fn(),
    } as any;

    guard = new RolesGuard(reflector, userRepository, jwtService);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
      }),
      getHandler: jest.fn(),
    } as any;
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', async () => {
      (reflector.get as jest.Mock).mockReturnValue(undefined);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(
        Roles,
        mockExecutionContext.getHandler(),
      );
    });

    it('should throw UnauthorizedException when no token is found', async () => {
      (reflector.get as jest.Mock).mockReturnValue([RolesHandler.admin]);
      const request = {
        headers: {},
      };
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
        getHandler: jest.fn(),
      } as any;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Authorization header not found',
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      (reflector.get as jest.Mock).mockReturnValue([RolesHandler.admin]);
      (jwtService.decode as jest.Mock).mockReturnValue(null);

      const request = {
        headers: {
          authorization: 'valid-token',
        },
      };
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
        getHandler: jest.fn(),
      } as any;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Invalid token',
      );
    });

    it('should throw UnauthorizedException when token payload lacks userId', async () => {
      (reflector.get as jest.Mock).mockReturnValue([RolesHandler.admin]);
      (jwtService.decode as jest.Mock).mockReturnValue({
        username: 'testuser',
      });

      const request = {
        headers: {
          authorization: 'valid-token',
        },
      };
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
        getHandler: jest.fn(),
      } as any;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token payload lacks username', async () => {
      (reflector.get as jest.Mock).mockReturnValue([RolesHandler.admin]);
      (jwtService.decode as jest.Mock).mockReturnValue({
        userId: 1,
      });

      const request = {
        headers: {
          authorization: 'valid-token',
        },
      };
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
        getHandler: jest.fn(),
      } as any;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      (reflector.get as jest.Mock).mockReturnValue([RolesHandler.admin]);
      (jwtService.decode as jest.Mock).mockReturnValue({
        userId: 1,
        username: 'testuser',
      });
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const request = {
        headers: {
          authorization: 'valid-token',
        },
      };
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
        getHandler: jest.fn(),
      } as any;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'User not found',
      );
    });

    it('should return true when user has required role', async () => {
      (reflector.get as jest.Mock).mockReturnValue([RolesHandler.admin]);
      (jwtService.decode as jest.Mock).mockReturnValue({
        userId: 1,
        username: 'testuser',
      });
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        roles: [
          {
            role: {
              description: RolesHandler.admin,
            },
          },
        ],
      });

      const request = {
        headers: {
          authorization: 'valid-token',
        },
      };
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
        getHandler: jest.fn(),
      } as any;

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [{ id: 1 }, { username: 'testuser' }],
        relations: {
          roles: {
            role: true,
          },
        },
      });
    });

    it('should throw UnauthorizedException when user does not have required role', async () => {
      (reflector.get as jest.Mock).mockReturnValue([RolesHandler.super]);
      (jwtService.decode as jest.Mock).mockReturnValue({
        userId: 1,
        username: 'testuser',
      });
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        roles: [
          {
            role: {
              description: RolesHandler.guest,
            },
          },
        ],
      });

      const request = {
        headers: {
          authorization: 'valid-token',
        },
      };
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
        getHandler: jest.fn(),
      } as any;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'You do not have the required role',
      );
    });

    it('should return true when user has one of multiple required roles', async () => {
      (reflector.get as jest.Mock).mockReturnValue([
        RolesHandler.admin,
        RolesHandler.crp,
      ]);
      (jwtService.decode as jest.Mock).mockReturnValue({
        userId: 1,
        username: 'testuser',
      });
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        roles: [
          {
            role: {
              description: RolesHandler.crp,
            },
          },
        ],
      });

      const request = {
        headers: {
          authorization: 'valid-token',
        },
      };
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
        getHandler: jest.fn(),
      } as any;

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle username with whitespace and case', async () => {
      (reflector.get as jest.Mock).mockReturnValue([RolesHandler.admin]);
      (jwtService.decode as jest.Mock).mockReturnValue({
        userId: 1,
        username: '  TestUser  ',
      });
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        roles: [
          {
            role: {
              description: RolesHandler.admin,
            },
          },
        ],
      });

      const request = {
        headers: {
          authorization: 'valid-token',
        },
      };
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
        getHandler: jest.fn(),
      } as any;

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [{ id: 1 }, { username: 'testuser' }],
        relations: {
          roles: {
            role: true,
          },
        },
      });
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should throw UnauthorizedException when authorization header is missing', () => {
      const request = {
        headers: {},
      };
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
        getHandler: jest.fn(),
      } as any;

      expect(() => {
        guard['extractTokenFromHeader'](undefined);
      }).toThrow(UnauthorizedException);
    });

    it('should return token when authorization header is present', () => {
      const token = 'valid-token';
      const result = guard['extractTokenFromHeader'](token);
      expect(result).toBe(token);
    });
  });
});
