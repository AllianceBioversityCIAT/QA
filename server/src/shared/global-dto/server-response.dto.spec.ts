import { HttpStatus } from '@nestjs/common';
import { ServerResponseDto } from './server-response.dto';
import { ServiceResponseDto } from './service-response.dto';

describe('ServerResponseDto', () => {
  it('should be defined', () => {
    expect(ServerResponseDto).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof ServerResponseDto).toBe('function');
  });

  it('should extend ServiceResponseDto', () => {
    const dto = new ServerResponseDto<string>();
    expect(dto).toBeInstanceOf(ServiceResponseDto);
  });

  it('should have all properties from ServiceResponseDto plus timestamp and path', () => {
    const dto = new ServerResponseDto<string>();
    dto.status = HttpStatus.OK;
    dto.description = 'Success';
    dto.data = 'test data';
    dto.errors = null;
    dto.timestamp = '2024-01-01T00:00:00.000Z';
    dto.path = '/api/test';

    expect(dto.status).toBe(HttpStatus.OK);
    expect(dto.description).toBe('Success');
    expect(dto.data).toBe('test data');
    expect(dto.errors).toBeNull();
    expect(dto.timestamp).toBe('2024-01-01T00:00:00.000Z');
    expect(dto.path).toBe('/api/test');
  });

  it('should allow optional data and errors properties', () => {
    const dto = new ServerResponseDto<null>();
    dto.status = HttpStatus.NO_CONTENT;
    dto.description = 'No content';
    dto.timestamp = '2024-01-01T00:00:00.000Z';
    dto.path = '/api/resource';

    expect(dto.data).toBeUndefined();
    expect(dto.errors).toBeUndefined();
    expect(dto.timestamp).toBeDefined();
    expect(dto.path).toBeDefined();
  });

  it('should work with different data types', () => {
    const stringDto = new ServerResponseDto<string>();
    stringDto.data = 'string data';
    stringDto.timestamp = '2024-01-01T00:00:00.000Z';
    stringDto.path = '/api/string';

    const arrayDto = new ServerResponseDto<string[]>();
    arrayDto.data = ['item1', 'item2'];
    arrayDto.timestamp = '2024-01-01T00:00:00.000Z';
    arrayDto.path = '/api/array';

    const objectDto = new ServerResponseDto<{ id: number }>();
    objectDto.data = { id: 1 };
    objectDto.timestamp = '2024-01-01T00:00:00.000Z';
    objectDto.path = '/api/object';

    expect(stringDto.data).toBe('string data');
    expect(arrayDto.data).toEqual(['item1', 'item2']);
    expect(objectDto.data).toEqual({ id: 1 });
  });

  it('should handle error responses with timestamp and path', () => {
    const dto = new ServerResponseDto<null>();
    dto.status = HttpStatus.BAD_REQUEST;
    dto.description = 'Validation failed';
    dto.errors = { field: 'Invalid value' };
    dto.timestamp = '2024-01-01T00:00:00.000Z';
    dto.path = '/api/validate';

    expect(dto.status).toBe(HttpStatus.BAD_REQUEST);
    expect(dto.errors).toEqual({ field: 'Invalid value' });
    expect(dto.timestamp).toBe('2024-01-01T00:00:00.000Z');
    expect(dto.path).toBe('/api/validate');
  });

  it('should accept ISO timestamp strings', () => {
    const dto = new ServerResponseDto<string>();
    const timestamp = new Date().toISOString();
    dto.timestamp = timestamp;
    dto.path = '/api/test';

    expect(dto.timestamp).toBe(timestamp);
    expect(typeof dto.timestamp).toBe('string');
  });

  it('should accept various path formats', () => {
    const paths = [
      '/api/test',
      '/api/users/1',
      '/api/comments?page=1',
      '/',
      '/api/v1/resource',
    ];

    paths.forEach((path) => {
      const dto = new ServerResponseDto<string>();
      dto.path = path;

      expect(dto.path).toBe(path);
    });
  });

  it('should maintain inheritance from ServiceResponseDto', () => {
    const dto = new ServerResponseDto<number>();
    dto.status = HttpStatus.CREATED;
    dto.description = 'Created';
    dto.data = 123;
    dto.timestamp = '2024-01-01T00:00:00.000Z';
    dto.path = '/api/create';

    // Verify all inherited properties work
    expect(dto.status).toBe(HttpStatus.CREATED);
    expect(dto.description).toBe('Created');
    expect(dto.data).toBe(123);
    // Verify new properties work
    expect(dto.timestamp).toBe('2024-01-01T00:00:00.000Z');
    expect(dto.path).toBe('/api/create');
  });
});
