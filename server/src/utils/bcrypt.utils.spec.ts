import { BcryptPasswordEncoder } from './bcrypt.utils';

describe('BcryptPasswordEncoder', () => {
    let encoder: BcryptPasswordEncoder;

    beforeEach(() => {
        encoder = new BcryptPasswordEncoder();
    });

    describe('encode', () => {
        it('should hash a password successfully', () => {
            const password = 'testPassword123';
            const hashed = encoder.encode(password);

            expect(hashed).toBeDefined();
            expect(typeof hashed).toBe('string');
            expect(hashed.length).toBeGreaterThan(0);
            expect(hashed).not.toBe(password);
        });

        it('should produce different hashes for the same password', () => {
            const password = 'testPassword123';
            const hash1 = encoder.encode(password);
            const hash2 = encoder.encode(password);

            expect(hash1).not.toBe(hash2);
        });

        it('should hash different passwords differently', () => {
            const password1 = 'password1';
            const password2 = 'password2';

            const hash1 = encoder.encode(password1);
            const hash2 = encoder.encode(password2);

            expect(hash1).not.toBe(hash2);
        });

        it('should handle empty string password', () => {
            const password = '';
            const hashed = encoder.encode(password);

            expect(hashed).toBeDefined();
            expect(typeof hashed).toBe('string');
        });

        it('should handle special characters in password', () => {
            const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const hashed = encoder.encode(password);

            expect(hashed).toBeDefined();
            expect(typeof hashed).toBe('string');
        });
    });

    describe('matches', () => {
        it('should return true when password matches hash', () => {
            const password = 'testPassword123';
            const hashed = encoder.encode(password);

            const result = encoder.matches(password, hashed);

            expect(result).toBe(true);
        });

        it('should return false when password does not match hash', () => {
            const password = 'testPassword123';
            const wrongPassword = 'wrongPassword';
            const hashed = encoder.encode(password);

            const result = encoder.matches(wrongPassword, hashed);

            expect(result).toBe(false);
        });

        it('should return false for empty password with valid hash', () => {
            const password = 'testPassword123';
            const hashed = encoder.encode(password);

            const result = encoder.matches('', hashed);

            expect(result).toBe(false);
        });

        it('should return false for valid password with empty hash', () => {
            const password = 'testPassword123';

            const result = encoder.matches(password, '');

            expect(result).toBe(false);
        });

        it('should return false for invalid hash format', () => {
            const password = 'testPassword123';
            const invalidHash = 'invalidHashString';

            const result = encoder.matches(password, invalidHash);

            expect(result).toBe(false);
        });

        it('should handle special characters correctly', () => {
            const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const hashed = encoder.encode(password);

            const result = encoder.matches(password, hashed);

            expect(result).toBe(true);
        });

        it('should handle case-sensitive passwords', () => {
            const password = 'TestPassword123';
            const hashed = encoder.encode(password);

            expect(encoder.matches('TestPassword123', hashed)).toBe(true);
            expect(encoder.matches('testpassword123', hashed)).toBe(false);
            expect(encoder.matches('TESTPASSWORD123', hashed)).toBe(false);
        });
    });
});
