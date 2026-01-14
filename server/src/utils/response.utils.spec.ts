import { HttpStatus } from '@nestjs/common';
import { ServiceResponseDto } from '../shared/global-dto/service-response.dto';
import { ResponseUtils } from './response.utils';

describe('ResponseUtils', () => {
    describe('format', () => {
        it('should format a complete ServiceResponseDto correctly', () => {
            const input: ServiceResponseDto<string> = {
                status: HttpStatus.OK,
                description: 'Success message',
                data: 'test data',
                errors: null,
            };

            const result = ResponseUtils.format(input);

            expect(result).toEqual({
                status: HttpStatus.OK,
                description: 'Success message',
                data: 'test data',
                errors: null,
            });
        });

        it('should format a ServiceResponseDto without data', () => {
            const input: ServiceResponseDto<null> = {
                status: HttpStatus.NO_CONTENT,
                description: 'No content',
                data: undefined,
                errors: undefined,
            };

            const result = ResponseUtils.format(input);

            expect(result).toEqual({
                status: HttpStatus.NO_CONTENT,
                description: 'No content',
                data: undefined,
                errors: undefined,
            });
        });

        it('should format a ServiceResponseDto with errors', () => {
            const input: ServiceResponseDto<null> = {
                status: HttpStatus.BAD_REQUEST,
                description: 'Validation failed',
                data: undefined,
                errors: { field: 'Invalid value' },
            };

            const result = ResponseUtils.format(input);

            expect(result).toEqual({
                status: HttpStatus.BAD_REQUEST,
                description: 'Validation failed',
                data: undefined,
                errors: { field: 'Invalid value' },
            });
        });

        it('should format a ServiceResponseDto with array data', () => {
            const input: ServiceResponseDto<string[]> = {
                status: HttpStatus.OK,
                description: 'List retrieved',
                data: ['item1', 'item2', 'item3'],
                errors: undefined,
            };

            const result = ResponseUtils.format(input);

            expect(result).toEqual({
                status: HttpStatus.OK,
                description: 'List retrieved',
                data: ['item1', 'item2', 'item3'],
                errors: undefined,
            });
        });

        it('should format a ServiceResponseDto with object data', () => {
            const input: ServiceResponseDto<{ id: number; name: string }> = {
                status: HttpStatus.CREATED,
                description: 'Resource created',
                data: { id: 1, name: 'Test Resource' },
                errors: undefined,
            };

            const result = ResponseUtils.format(input);

            expect(result).toEqual({
                status: HttpStatus.CREATED,
                description: 'Resource created',
                data: { id: 1, name: 'Test Resource' },
                errors: undefined,
            });
        });

        it('should handle null data correctly', () => {
            const input: ServiceResponseDto<null> = {
                status: HttpStatus.OK,
                description: 'Success',
                data: null,
                errors: null,
            };

            const result = ResponseUtils.format(input);

            expect(result).toEqual({
                status: HttpStatus.OK,
                description: 'Success',
                data: null,
                errors: null,
            });
        });

        it('should handle complex error objects', () => {
            const input: ServiceResponseDto<null> = {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                description: 'Server error',
                data: undefined,
                errors: {
                    message: 'Something went wrong',
                    code: 'ERR_001',
                    details: ['Detail 1', 'Detail 2'],
                },
            };

            const result = ResponseUtils.format(input);

            expect(result).toEqual({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                description: 'Server error',
                data: undefined,
                errors: {
                    message: 'Something went wrong',
                    code: 'ERR_001',
                    details: ['Detail 1', 'Detail 2'],
                },
            });
        });

        it('should preserve all HttpStatus values', () => {
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
                const input: ServiceResponseDto<string> = {
                    status,
                    description: `Status ${status}`,
                    data: 'test',
                };

                const result = ResponseUtils.format(input);

                expect(result.status).toBe(status);
            });
        });

        it('should return a new object (not the same reference)', () => {
            const input: ServiceResponseDto<string> = {
                status: HttpStatus.OK,
                description: 'Test',
                data: 'data',
            };

            const result = ResponseUtils.format(input);

            expect(result).not.toBe(input);
            expect(result).toEqual(input);
        });
    });
});
