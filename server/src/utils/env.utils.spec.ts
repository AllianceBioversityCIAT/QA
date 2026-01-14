import { ENV } from './env.utils';

describe('ENV', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset process.env before each test
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        // Restore original process.env after all tests
        process.env = originalEnv;
    });

    describe('IS_PRODUCTION', () => {
        it('should return true when IS_PRODUCTION is "true"', () => {
            process.env.IS_PRODUCTION = 'true';
            expect(ENV.IS_PRODUCTION).toBe(true);
        });

        it('should return false when IS_PRODUCTION is "false"', () => {
            process.env.IS_PRODUCTION = 'false';
            expect(ENV.IS_PRODUCTION).toBe(false);
        });

        it('should return false when IS_PRODUCTION is undefined', () => {
            delete process.env.IS_PRODUCTION;
            expect(ENV.IS_PRODUCTION).toBe(false);
        });

        it('should return false when IS_PRODUCTION is empty string', () => {
            process.env.IS_PRODUCTION = '';
            expect(ENV.IS_PRODUCTION).toBe(false);
        });

        it('should return false when IS_PRODUCTION is any other value', () => {
            process.env.IS_PRODUCTION = 'yes';
            expect(ENV.IS_PRODUCTION).toBe(false);

            process.env.IS_PRODUCTION = '1';
            expect(ENV.IS_PRODUCTION).toBe(false);

            process.env.IS_PRODUCTION = 'True';
            expect(ENV.IS_PRODUCTION).toBe(false);
        });
    });

    describe('SEE_ALL_LOGS', () => {
        it('should return true when SEE_ALL_LOGS is "true"', () => {
            process.env.SEE_ALL_LOGS = 'true';
            expect(ENV.SEE_ALL_LOGS).toBe(true);
        });

        it('should return false when SEE_ALL_LOGS is "false"', () => {
            process.env.SEE_ALL_LOGS = 'false';
            expect(ENV.SEE_ALL_LOGS).toBe(false);
        });

        it('should return false when SEE_ALL_LOGS is undefined', () => {
            delete process.env.SEE_ALL_LOGS;
            expect(ENV.SEE_ALL_LOGS).toBe(false);
        });

        it('should return false when SEE_ALL_LOGS is empty string', () => {
            process.env.SEE_ALL_LOGS = '';
            expect(ENV.SEE_ALL_LOGS).toBe(false);
        });

        it('should return false when SEE_ALL_LOGS is any other value', () => {
            process.env.SEE_ALL_LOGS = 'yes';
            expect(ENV.SEE_ALL_LOGS).toBe(false);

            process.env.SEE_ALL_LOGS = '1';
            expect(ENV.SEE_ALL_LOGS).toBe(false);

            process.env.SEE_ALL_LOGS = 'True';
            expect(ENV.SEE_ALL_LOGS).toBe(false);
        });
    });

    describe('validateEnvBoolean', () => {
        it('should handle multiple environment variables independently', () => {
            process.env.IS_PRODUCTION = 'true';
            process.env.SEE_ALL_LOGS = 'false';

            expect(ENV.IS_PRODUCTION).toBe(true);
            expect(ENV.SEE_ALL_LOGS).toBe(false);
        });

        it('should handle both set to true', () => {
            process.env.IS_PRODUCTION = 'true';
            process.env.SEE_ALL_LOGS = 'true';

            expect(ENV.IS_PRODUCTION).toBe(true);
            expect(ENV.SEE_ALL_LOGS).toBe(true);
        });

        it('should handle both set to false', () => {
            process.env.IS_PRODUCTION = 'false';
            process.env.SEE_ALL_LOGS = 'false';

            expect(ENV.IS_PRODUCTION).toBe(false);
            expect(ENV.SEE_ALL_LOGS).toBe(false);
        });
    });
});
