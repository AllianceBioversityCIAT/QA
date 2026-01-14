import { HttpStatus } from '@nestjs/common';
import { ServiceResponseDto } from './service-response.dto';

describe('ServiceResponseDto', () => {
  it('should be defined', () => {
    expect(ServiceResponseDto).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof ServiceResponseDto).toBe('function');
  });

  it('should create an instance with all properties', () => {
    const dto = new ServiceResponseDto<string>();
    dto.status = HttpStatus.OK;
    dto.description = 'Success';
    dto.data = 'test data';
    dto.errors = null;

    expect(dto.status).toBe(HttpStatus.OK);
    expect(dto.description).toBe('Success');
    expect(dto.data).toBe('test data');
    expect(dto.errors).toBeNull();
  });

  it('should allow optional data property', () => {
    const dto = new ServiceResponseDto<string>();
    dto.status = HttpStatus.NO_CONTENT;
    dto.description = 'No content';

    expect(dto.data).toBeUndefined();
    expect(dto.status).toBe(HttpStatus.NO_CONTENT);
    expect(dto.description).toBe('No content');
  });

  it('should allow optional errors property', () => {
    const dto = new ServiceResponseDto<string>();
    dto.status = HttpStatus.OK;
    dto.description = 'Success';
    dto.data = 'test';

    expect(dto.errors).toBeUndefined();
  });

  it('should work with different data types', () => {
    const stringDto = new ServiceResponseDto<string>();
    stringDto.data = 'string data';

    const numberDto = new ServiceResponseDto<number>();
    numberDto.data = 123;

    const arrayDto = new ServiceResponseDto<string[]>();
    arrayDto.data = ['item1', 'item2'];

    const objectDto = new ServiceResponseDto<{ id: number; name: string }>();
    objectDto.data = { id: 1, name: 'test' };

    expect(stringDto.data).toBe('string data');
    expect(numberDto.data).toBe(123);
    expect(arrayDto.data).toEqual(['item1', 'item2']);
    expect(objectDto.data).toEqual({ id: 1, name: 'test' });
  });

  it('should handle error responses', () => {
    const dto = new ServiceResponseDto<null>();
    dto.status = HttpStatus.BAD_REQUEST;
    dto.description = 'Validation failed';
    dto.data = null;
    dto.errors = { field: 'Invalid value' };

    expect(dto.status).toBe(HttpStatus.BAD_REQUEST);
    expect(dto.description).toBe('Validation failed');
    expect(dto.errors).toEqual({ field: 'Invalid value' });
  });

  it('should handle complex error objects', () => {
    const dto = new ServiceResponseDto<null>();
    dto.status = HttpStatus.INTERNAL_SERVER_ERROR;
    dto.description = 'Server error';
    dto.errors = {
      message: 'Something went wrong',
      code: 'ERR_001',
      details: ['Detail 1', 'Detail 2'],
    };

    expect(dto.errors).toHaveProperty('message');
    expect(dto.errors).toHaveProperty('code');
    expect(dto.errors).toHaveProperty('details');
  });

  it('should work with all HttpStatus values', () => {
    const statuses = [
      HttpStatus.OK,
      HttpStatus.CREATED,
      HttpStatus.BAD_REQUEST,
      HttpStatus.UNAUTHORIZED,
      HttpStatus.FORBIDDEN,
      HttpStatus.NOT_FOUND,
      HttpStatus.INTERNAL_SERVER_ERROR,
    ];

    statuses.forEach((status) => {
      const dto = new ServiceResponseDto<string>();
      dto.status = status;
      dto.description = `Status ${status}`;

      expect(dto.status).toBe(status);
    });
  });
});
