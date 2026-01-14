import { TokenDto } from './token.dto';

describe('TokenDto', () => {
  it('should be defined', () => {
    expect(TokenDto).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof TokenDto).toBe('function');
  });

  it('should create an instance with all required properties', () => {
    const dto = new TokenDto();
    dto.userId = 1;
    dto.username = 'testuser';
    dto.role = [];

    expect(dto.userId).toBe(1);
    expect(dto.username).toBe('testuser');
    expect(dto.role).toEqual([]);
  });

  it('should accept array of roles', () => {
    const dto = new TokenDto();
    dto.userId = 1;
    dto.username = 'testuser';
    dto.role = ['ADMIN', 'SUPER_ADM'];

    expect(dto.role).toEqual(['ADMIN', 'SUPER_ADM']);
    expect(dto.role).toHaveLength(2);
  });

  it('should accept role objects', () => {
    const dto = new TokenDto();
    dto.userId = 1;
    dto.username = 'testuser';
    dto.role = [
      { id: 1, description: 'ADMIN' },
      { id: 2, description: 'CRP' },
    ];

    expect(dto.role).toHaveLength(2);
    expect(dto.role[0]).toHaveProperty('id', 1);
    expect(dto.role[1]).toHaveProperty('description', 'CRP');
  });

  it('should accept empty role array', () => {
    const dto = new TokenDto();
    dto.userId = 1;
    dto.username = 'testuser';
    dto.role = [];

    expect(dto.role).toEqual([]);
    expect(dto.role).toHaveLength(0);
  });

  it('should handle different userId values', () => {
    const userIds = [1, 100, 999, 0];

    userIds.forEach((userId) => {
      const dto = new TokenDto();
      dto.userId = userId;
      dto.username = 'testuser';
      dto.role = [];

      expect(dto.userId).toBe(userId);
    });
  });

  it('should handle different username formats', () => {
    const usernames = [
      'testuser',
      'test.user',
      'test_user',
      'test-user',
      'test@example.com',
      'user123',
    ];

    usernames.forEach((username) => {
      const dto = new TokenDto();
      dto.userId = 1;
      dto.username = username;
      dto.role = [];

      expect(dto.username).toBe(username);
    });
  });

  it('should handle complex role structures', () => {
    const dto = new TokenDto();
    dto.userId = 1;
    dto.username = 'testuser';
    dto.role = [
      {
        id: 1,
        description: 'ADMIN',
        permissions: ['read', 'write', 'delete'],
        createdAt: new Date(),
      },
      {
        id: 2,
        description: 'CRP',
        permissions: ['read'],
      },
    ];

    expect(dto.role).toHaveLength(2);
    expect(dto.role[0]).toHaveProperty('permissions');
    expect(dto.role[1]).toHaveProperty('permissions');
  });

  it('should allow any type for role array', () => {
    const dto = new TokenDto();
    dto.userId = 1;
    dto.username = 'testuser';

    // Test with strings
    dto.role = ['ADMIN', 'CRP'];
    expect(dto.role).toEqual(['ADMIN', 'CRP']);

    // Test with numbers
    dto.role = [1, 2, 3] as any;
    expect(dto.role).toEqual([1, 2, 3]);

    // Test with mixed types
    dto.role = ['ADMIN', { id: 1 }, 5] as any;
    expect(dto.role).toHaveLength(3);
  });
});
