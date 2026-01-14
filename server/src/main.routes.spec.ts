import { MainRoutes } from './main.routes';
import { ModulesRoutes } from './api/modules.routes';

describe('MainRoutes', () => {
  it('should be defined', () => {
    expect(MainRoutes).toBeDefined();
  });

  it('should be an array', () => {
    expect(Array.isArray(MainRoutes)).toBe(true);
  });

  it('should have one route configuration', () => {
    expect(MainRoutes).toHaveLength(1);
  });

  it('should have correct path for API routes', () => {
    expect(MainRoutes[0]).toHaveProperty('path', 'api/');
  });

  it('should have children routes from ModulesRoutes', () => {
    expect(MainRoutes[0]).toHaveProperty('children');
    expect(MainRoutes[0].children).toBe(ModulesRoutes);
  });

  it('should match the expected route structure', () => {
    const expectedStructure = {
      path: 'api/',
      children: ModulesRoutes,
    };

    expect(MainRoutes[0]).toMatchObject(expectedStructure);
  });
});
