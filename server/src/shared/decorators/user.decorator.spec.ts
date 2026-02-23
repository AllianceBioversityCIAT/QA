import {
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserToken, processUserToken } from './user.decorator';
import { TokenDto } from '../global-dto/token.dto';

describe('UserToken Decorator', () => {
  describe('UserToken decorator', () => {
    it('should be defined', () => {
      expect(UserToken).toBeDefined();
      expect(typeof UserToken).toBe('function');
    });
  });

  describe('processUserToken', () => {
    it('should parse token correctly from JWT-like format', () => {
      const tokenData: TokenDto = {
        userId: 1,
        username: 'testuser',
        role: [],
      };
      const tokenPayload = Buffer.from(JSON.stringify(tokenData)).toString(
        'base64',
      );
      const headerValue = `header.${tokenPayload}.signature`;

      const result = processUserToken(headerValue);

      expect(result).toEqual(tokenData);
      expect(result.userId).toBe(1);
      expect(result.username).toBe('testuser');
    });

    it('should parse token with roles', () => {
      const tokenData: TokenDto = {
        userId: 2,
        username: 'admin',
        role: ['ADMIN', 'SUPER_ADM'],
      };
      const tokenPayload = Buffer.from(JSON.stringify(tokenData)).toString(
        'base64',
      );
      const headerValue = `header.${tokenPayload}.signature`;

      const result = processUserToken(headerValue);

      expect(result).toEqual(tokenData);
      expect(result.role).toEqual(['ADMIN', 'SUPER_ADM']);
    });

    it('should handle complex token data', () => {
      const tokenData: TokenDto = {
        userId: 100,
        username: 'complex.user@example.com',
        role: [
          { id: 1, name: 'ADMIN' },
          { id: 2, name: 'CRP' },
        ],
      };
      const tokenPayload = Buffer.from(JSON.stringify(tokenData)).toString(
        'base64',
      );
      const headerValue = `header.${tokenPayload}.signature`;

      const result = processUserToken(headerValue);

      expect(result.userId).toBe(100);
      expect(result.username).toBe('complex.user@example.com');
      expect(result.role).toHaveLength(2);
    });

    it('should handle empty role array', () => {
      const tokenData: TokenDto = {
        userId: 5,
        username: 'nouser',
        role: [],
      };
      const tokenPayload = Buffer.from(JSON.stringify(tokenData)).toString(
        'base64',
      );
      const headerValue = `header.${tokenPayload}.signature`;

      const result = processUserToken(headerValue);

      expect(result.role).toEqual([]);
      expect(result.userId).toBe(5);
      expect(result.username).toBe('nouser');
    });
  });

  describe('UserToken decorator factory logic', () => {
    let mockExecutionContext: ExecutionContext;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as any;
    });

    it('should extract header value from request', () => {
      const tokenData: TokenDto = {
        userId: 1,
        username: 'testuser',
        role: [],
      };
      const tokenPayload = Buffer.from(JSON.stringify(tokenData)).toString(
        'base64',
      );
      const headerValue = `header.${tokenPayload}.signature`;

      mockRequest.headers.authorization = headerValue;

      // Test the logic that would be executed by the decorator factory
      const request = mockExecutionContext.switchToHttp().getRequest();
      const extractedHeader = request.headers['authorization'];
      const result = processUserToken(extractedHeader);

      expect(result).toEqual(tokenData);
    });

    it('should handle missing authorization header', () => {
      mockRequest.headers.authorization = undefined;

      const request = mockExecutionContext.switchToHttp().getRequest();
      const headerValue = request.headers['authorization'];

      expect(headerValue).toBeUndefined();
    });

    it('should extract from custom header name', () => {
      const tokenData: TokenDto = {
        userId: 3,
        username: 'customuser',
        role: [],
      };
      const tokenPayload = Buffer.from(JSON.stringify(tokenData)).toString(
        'base64',
      );
      const headerValue = `header.${tokenPayload}.signature`;

      mockRequest.headers['x-custom-auth'] = headerValue;

      const request = mockExecutionContext.switchToHttp().getRequest();
      const extractedHeader = request.headers['x-custom-auth'];
      const result = processUserToken(extractedHeader);

      expect(result).toEqual(tokenData);
    });
  });
});
