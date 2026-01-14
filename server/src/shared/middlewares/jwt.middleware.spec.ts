import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtMiddleware } from './jwt.middleware';
import { AuthService } from '../../api/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import constConfig from '../../config/const.config';

describe('JwtMiddleware', () => {
  let middleware: JwtMiddleware;
  let authService: jest.Mocked<AuthService>;
  let jwtService: jest.Mocked<JwtService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response & { locals: any }>;
  let mockNext: NextFunction;

  beforeEach(() => {
    authService = {
      loginService: jest.fn(),
    } as any;

    jwtService = {
      verifyAsync: jest.fn(),
      signAsync: jest.fn(),
    } as any;

    middleware = new JwtMiddleware(authService, jwtService);

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      locals: {},
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe('use', () => {
    it('should process Basic auth and set JWT token', async () => {
      const username = 'testuser';
      const password = 'testpass';
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      const token = 'new-jwt-token';
      const jwtPayload = { userId: 1, username: 'testuser' };

      mockRequest.headers = {
        authorization: `Basic ${credentials}`,
      };

      (authService.loginService as jest.Mock).mockResolvedValue({
        data: { token },
      });

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(jwtPayload);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('refreshed-token');

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response & { locals: any },
        mockNext,
      );

      expect(authService.loginService).toHaveBeenCalledWith({
        username,
        password,
      });
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: constConfig.jwtSecret,
        ignoreExpiration: true,
      });
      expect(mockResponse.locals.jwtPayload).toEqual(jwtPayload);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'authorization',
        'refreshed-token',
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should process JWT token from authorization header', async () => {
      const token = 'existing-jwt-token';
      const jwtPayload = { userId: 1, username: 'testuser' };
      const refreshedToken = 'refreshed-jwt-token';

      mockRequest.headers = {
        authorization: token,
      };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(jwtPayload);
      (jwtService.signAsync as jest.Mock).mockResolvedValue(refreshedToken);

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response & { locals: any },
        mockNext,
      );

      expect(authService.loginService).not.toHaveBeenCalled();
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: constConfig.jwtSecret,
        ignoreExpiration: true,
      });
      expect(mockResponse.locals.jwtPayload).toEqual(jwtPayload);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'authorization',
        refreshedToken,
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw HttpException when no token is provided', async () => {
      mockRequest.headers = {};

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response & { locals: any },
          mockNext,
        ),
      ).rejects.toThrow(HttpException);

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response & { locals: any },
          mockNext,
        ),
      ).rejects.toThrow('Invalid token');
    });

    it('should throw HttpException with UNAUTHORIZED status when no token', async () => {
      mockRequest.headers = {};

      try {
        await middleware.use(
          mockRequest as Request,
          mockResponse as Response & { locals: any },
          mockNext,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('should throw HttpException when token verification fails', async () => {
      const token = 'invalid-token';

      mockRequest.headers = {
        authorization: token,
      };

      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response & { locals: any },
          mockNext,
        ),
      ).rejects.toThrow(HttpException);

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response & { locals: any },
          mockNext,
        ),
      ).rejects.toThrow('Invalid token');
    });

    it('should throw HttpException with UNAUTHORIZED status when token is invalid', async () => {
      const token = 'invalid-token';

      mockRequest.headers = {
        authorization: token,
      };

      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      try {
        await middleware.use(
          mockRequest as Request,
          mockResponse as Response & { locals: any },
          mockNext,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('should throw HttpException when loginService fails', async () => {
      const username = 'testuser';
      const password = 'testpass';
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');

      mockRequest.headers = {
        authorization: `Basic ${credentials}`,
      };

      (authService.loginService as jest.Mock).mockRejectedValue(
        new Error('Login failed'),
      );

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response & { locals: any },
          mockNext,
        ),
      ).rejects.toThrow(HttpException);
    });

    it('should handle Basic auth with special characters in credentials', async () => {
      const username = 'user@example.com';
      const password = 'p@ssw0rd!';
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      const token = 'new-jwt-token';
      const jwtPayload = { userId: 1, username };

      mockRequest.headers = {
        authorization: `Basic ${credentials}`,
      };

      (authService.loginService as jest.Mock).mockResolvedValue({
        data: { token },
      });

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(jwtPayload);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('refreshed-token');

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response & { locals: any },
        mockNext,
      );

      expect(authService.loginService).toHaveBeenCalledWith({
        username,
        password,
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sign new token with correct options', async () => {
      const token = 'existing-jwt-token';
      const jwtPayload = { userId: 1, username: 'testuser' };
      const refreshedToken = 'refreshed-jwt-token';

      mockRequest.headers = {
        authorization: token,
      };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(jwtPayload);
      (jwtService.signAsync as jest.Mock).mockResolvedValue(refreshedToken);

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response & { locals: any },
        mockNext,
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { jwtPayload },
        {
          secret: constConfig.jwtSecret,
          expiresIn: constConfig.jwtTime,
        },
      );
    });

    it('should handle empty Basic auth credentials', async () => {
      const credentials = Buffer.from(':').toString('base64');

      mockRequest.headers = {
        authorization: `Basic ${credentials}`,
      };

      (authService.loginService as jest.Mock).mockResolvedValue({
        data: { token: 'token' },
      });

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({});
      (jwtService.signAsync as jest.Mock).mockResolvedValue('refreshed-token');

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response & { locals: any },
        mockNext,
      );

      expect(authService.loginService).toHaveBeenCalledWith({
        username: '',
        password: '',
      });
    });
  });
});
