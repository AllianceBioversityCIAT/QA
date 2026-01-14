import { ArgumentsHost, HttpStatus, BadRequestException, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { GlobalExceptions } from './global.exception';
import { ServerResponseDto } from '../global-dto/server-response.dto';

describe('GlobalExceptions', () => {
  let filter: GlobalExceptions;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: any;
  let mockRequest: any;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    filter = new GlobalExceptions();
    loggerErrorSpy = jest.spyOn(filter['_logger'], 'error').mockImplementation();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/api/test',
      method: 'GET',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should be an instance of ExceptionFilter', () => {
    expect(filter).toBeInstanceOf(GlobalExceptions);
  });

  describe('catch', () => {
    it('should handle BadRequestException correctly', () => {
      const exception = new BadRequestException('Bad request error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.BAD_REQUEST,
          description: 'BadRequestException',
          errors: 'Bad request error',
          path: '/api/test',
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle NotFoundException correctly', () => {
      const exception = new NotFoundException('Resource not found');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.NOT_FOUND,
          description: 'NotFoundException',
          errors: 'Resource not found',
          path: '/api/test',
        }),
      );
    });

    it('should handle InternalServerErrorException correctly', () => {
      const exception = new InternalServerErrorException('Internal server error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          description: 'InternalServerErrorException',
          errors: 'Internal server error',
        }),
      );
    });

    it('should use default status when exception has no status', () => {
      const exception = { message: 'Generic error', name: 'Error' };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          description: 'Error',
          errors: 'Generic error',
        }),
      );
    });

    it('should handle exception with status but no name', () => {
      const exception = {
        status: HttpStatus.FORBIDDEN,
        message: 'Forbidden error',
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.FORBIDDEN,
          description: undefined,
          errors: 'Forbidden error',
        }),
      );
    });

    it('should handle exception with no message', () => {
      const exception = {
        status: HttpStatus.UNAUTHORIZED,
        name: 'UnauthorizedException',
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNAUTHORIZED,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.UNAUTHORIZED,
          description: 'UnauthorizedException',
          errors: undefined,
        }),
      );
    });

    it('should include timestamp in response', () => {
      const exception = new BadRequestException('Test error');
      const beforeTime = new Date().toISOString();

      filter.catch(exception, mockArgumentsHost);

      const afterTime = new Date().toISOString();
      const callArgs = mockResponse.json.mock.calls[0][0];

      expect(callArgs.timestamp).toBeDefined();
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(callArgs.timestamp >= beforeTime).toBe(true);
      expect(callArgs.timestamp <= afterTime).toBe(true);
    });

    it('should include path from request', () => {
      const exception = new BadRequestException('Test error');
      mockRequest.url = '/api/users/123';

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/users/123',
        }),
      );
    });

    it('should log error stack', () => {
      const exception = new InternalServerErrorException('Test error');
      exception.stack = 'Error stack trace';

      filter.catch(exception, mockArgumentsHost);

      expect(loggerErrorSpy).toHaveBeenCalledWith('Error stack trace');
    });

    it('should handle exception with null stack', () => {
      const exception = new BadRequestException('Test error');
      exception.stack = null;

      filter.catch(exception, mockArgumentsHost);

      expect(loggerErrorSpy).toHaveBeenCalledWith(null);
    });

    it('should handle exception with undefined stack', () => {
      const exception = { message: 'Test', name: 'Error' };

      filter.catch(exception, mockArgumentsHost);

      expect(loggerErrorSpy).toHaveBeenCalledWith(undefined);
    });

    it('should handle different HTTP status codes', () => {
      const statusCodes = [
        HttpStatus.OK,
        HttpStatus.CREATED,
        HttpStatus.BAD_REQUEST,
        HttpStatus.UNAUTHORIZED,
        HttpStatus.FORBIDDEN,
        HttpStatus.NOT_FOUND,
        HttpStatus.CONFLICT,
        HttpStatus.INTERNAL_SERVER_ERROR,
      ];

      statusCodes.forEach((status) => {
        const exception = {
          status,
          name: 'TestException',
          message: 'Test error',
        };

        filter.catch(exception, mockArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(status);
      });
    });

    it('should return ServerResponseDto format', () => {
      const exception = new BadRequestException('Test error');

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];

      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('description');
      expect(response).toHaveProperty('errors');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('path');
    });

    it('should handle complex error objects', () => {
      const exception = {
        status: HttpStatus.BAD_REQUEST,
        name: 'ValidationException',
        message: 'Validation failed',
        errors: ['Field 1 is required', 'Field 2 is invalid'],
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.BAD_REQUEST,
          description: 'ValidationException',
          errors: 'Validation failed', // Only message is used, not errors array
        }),
      );
    });

    it('should handle empty exception object', () => {
      const exception = {};

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          description: undefined,
          errors: undefined,
        }),
      );
    });

    it('should call response.status().json() in correct order', () => {
      const exception = new BadRequestException('Test error');
      const statusSpy = jest.spyOn(mockResponse, 'status');
      const jsonSpy = jest.spyOn(mockResponse, 'json');

      filter.catch(exception, mockArgumentsHost);

      expect(statusSpy).toHaveBeenCalled();
      expect(jsonSpy).toHaveBeenCalled();
      // Verify that status was called before json by checking call order
      expect(statusSpy.mock.invocationCallOrder[0]).toBeLessThan(
        jsonSpy.mock.invocationCallOrder[0],
      );
    });
  });
});
