import {
  ExecutionContext,
  CallHandler,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';
import { ServiceResponseDto } from '../global-dto/service-response.dto';
import { ServerResponseDto } from '../global-dto/server-response.dto';
import { ENV } from '../../utils/env.utils';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockResponse: any;
  let mockRequest: any;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerVerboseSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
    loggerWarnSpy = jest.spyOn(interceptor['_logger'], 'warn');
    loggerErrorSpy = jest.spyOn(interceptor['_logger'], 'error');
    loggerVerboseSpy = jest.spyOn(interceptor['_logger'], 'verbose');

    mockRequest = {
      method: 'GET',
      url: '/test',
      socket: {
        remoteAddress: '127.0.0.1',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.IS_PRODUCTION;
    delete process.env.SEE_ALL_LOGS;
  });

  describe('intercept', () => {
    it('should transform ServiceResponseDto to ServerResponseDto', (done) => {
      const serviceResponse: ServiceResponseDto<string> = {
        status: HttpStatus.OK,
        description: 'Success',
        data: 'test data',
        errors: null,
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(serviceResponse));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe((result) => {
        expect(result).toMatchObject({
          status: HttpStatus.OK,
          description: 'Success',
          data: 'test data',
          errors: null,
        });
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('path');
        expect(result.path).toBe('/test');
        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
        done();
      });
    });

    it('should handle default response when no ServiceResponseDto', (done) => {
      mockCallHandler.handle = jest.fn().mockReturnValue(of({ someData: 'test' }));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe((result) => {
        expect(result).toMatchObject({
          data: [],
          status: HttpStatus.OK,
          description: 'Unknown message',
          errors: null,
        });
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('path');
        done();
      });
    });

    it('should handle error objects', (done) => {
      // Create a mock error object that matches what isError() checks for
      const error: any = {
        name: 'InternalServerErrorException',
        description: 'Test error',
        message: 'Test error',
        stack: 'Error stack trace',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(error));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe({
        next: (result) => {
          expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          // The interceptor uses res.name for description
          expect(result.description).toBe('InternalServerErrorException');
          expect(result.errors).toBe('Test error');
          expect(mockResponse.status).toHaveBeenCalledWith(
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
          done();
        },
        error: (err) => {
          done(err);
        },
      });
    });

    it('should set response status code', (done) => {
      const serviceResponse: ServiceResponseDto<string> = {
        status: HttpStatus.CREATED,
        description: 'Created',
        data: 'new resource',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(serviceResponse));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe(() => {
        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
        done();
      });
    });

    it('should include timestamp in response', (done) => {
      const serviceResponse: ServiceResponseDto<string> = {
        status: HttpStatus.OK,
        description: 'Success',
        data: 'test',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(serviceResponse));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe((result) => {
        expect(result.timestamp).toBeDefined();
        expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(
          Date.now(),
        );
        done();
      });
    });

    it('should use Microservice as IP when remoteAddress is missing', (done) => {
      mockRequest.socket = undefined;

      const serviceResponse: ServiceResponseDto<string> = {
        status: HttpStatus.OK,
        description: 'Success',
        data: 'test',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(serviceResponse));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe((result) => {
        expect(result).toBeDefined();
        done();
      });
    });
  });

  describe('logBasedOnStatus', () => {
    it('should log warning for 3xx status codes', (done) => {
      process.env.SEE_ALL_LOGS = 'true';
      const serviceResponse: ServiceResponseDto<string> = {
        status: HttpStatus.MOVED_PERMANENTLY,
        description: 'Moved',
        data: 'test',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(serviceResponse));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe(() => {
        expect(loggerWarnSpy).toHaveBeenCalled();
        done();
      });
    });

    it('should log error for 5xx status codes', (done) => {
      process.env.SEE_ALL_LOGS = 'true';
      const serviceResponse: ServiceResponseDto<string> = {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Error',
        data: 'test',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(serviceResponse));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe(() => {
        expect(loggerErrorSpy).toHaveBeenCalled();
        done();
      });
    });

    it('should log verbose for 2xx status codes when not in production and SEE_ALL_LOGS is true', (done) => {
      process.env.IS_PRODUCTION = 'false';
      process.env.SEE_ALL_LOGS = 'true';
      const serviceResponse: ServiceResponseDto<string> = {
        status: HttpStatus.OK,
        description: 'Success',
        data: 'test',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(serviceResponse));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe(() => {
        expect(loggerVerboseSpy).toHaveBeenCalled();
        done();
      });
    });

    it('should not log verbose for 2xx status codes when in production', (done) => {
      process.env.IS_PRODUCTION = 'true';
      process.env.SEE_ALL_LOGS = 'true';
      const serviceResponse: ServiceResponseDto<string> = {
        status: HttpStatus.OK,
        description: 'Success',
        data: 'test',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(serviceResponse));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe(() => {
        expect(loggerVerboseSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not log verbose for 2xx status codes when SEE_ALL_LOGS is false', (done) => {
      process.env.IS_PRODUCTION = 'false';
      process.env.SEE_ALL_LOGS = 'false';
      const serviceResponse: ServiceResponseDto<string> = {
        status: HttpStatus.OK,
        description: 'Success',
        data: 'test',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(serviceResponse));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe(() => {
        expect(loggerVerboseSpy).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('isServiceResponseDto', () => {
    it('should identify ServiceResponseDto correctly', (done) => {
      const validDto: ServiceResponseDto<string> = {
        status: HttpStatus.OK,
        description: 'Test',
        data: 'test',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(validDto));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe((result) => {
        expect(result.status).toBe(HttpStatus.OK);
        expect(result.description).toBe('Test');
        done();
      });
    });

    it('should not identify object without status as ServiceResponseDto', (done) => {
      const invalidDto = {
        description: 'Test',
        data: 'test',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(invalidDto));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe((result) => {
        expect(result.status).toBe(HttpStatus.OK);
        expect(result.description).toBe('Unknown message');
        done();
      });
    });

    it('should not identify object without description as ServiceResponseDto', (done) => {
      const invalidDto = {
        status: HttpStatus.OK,
        data: 'test',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(invalidDto));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe((result) => {
        expect(result.status).toBe(HttpStatus.OK);
        expect(result.description).toBe('Unknown message');
        done();
      });
    });
  });

  describe('isError', () => {
    it('should identify error objects correctly', (done) => {
      // Create a mock error object that matches what isError() checks for
      const error: any = {
        name: 'InternalServerErrorException',
        description: 'Test error',
        message: 'Test error',
        stack: 'Error stack trace',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(error));

      const observable = interceptor.intercept(mockExecutionContext, mockCallHandler);

      observable.subscribe({
        next: (result) => {
          expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          // The interceptor uses res.name for description
          expect(result.description).toBe('InternalServerErrorException');
          expect(result.errors).toBe('Test error');
          done();
        },
        error: (err) => {
          done(err);
        },
      });
    });
  });
});
