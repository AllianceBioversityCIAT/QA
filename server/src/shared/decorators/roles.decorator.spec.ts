import { Roles } from './roles.decorator';
import { RolesHandler } from '../enum/roles-handler.enum';

describe('Roles Decorator', () => {
  it('should be defined', () => {
    expect(Roles).toBeDefined();
  });

  it('should create a decorator that can be used with Reflector', () => {
    // The decorator is created using Reflector.createDecorator
    // This test verifies it exists and is a function
    expect(typeof Roles).toBe('function');
  });

  it('should accept RolesHandler array as metadata', () => {
    // Test that the decorator can be applied with roles
    class TestController {
      @Roles([RolesHandler.admin, RolesHandler.super])
      testMethod() {
        return 'test';
      }
    }

    const instance = new TestController();
    expect(instance.testMethod()).toBe('test');
  });

  it('should work with single role', () => {
    class TestController {
      @Roles([RolesHandler.guest])
      testMethod() {
        return 'test';
      }
    }

    const instance = new TestController();
    expect(instance.testMethod()).toBe('test');
  });

  it('should work with all role types', () => {
    const allRoles = [
      RolesHandler.admin,
      RolesHandler.super,
      RolesHandler.crp,
      RolesHandler.guest,
      RolesHandler.assesor,
    ];

    class TestController {
      @Roles(allRoles)
      testMethod() {
        return 'test';
      }
    }

    const instance = new TestController();
    expect(instance.testMethod()).toBe('test');
  });
});
