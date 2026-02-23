import { Role } from '../_models/roles.model';
import { GeneralStatus } from '../_models/general-status.model';

export function createMockUser(overrides: any = {}) {
  return {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed',
    roles: [{ description: Role.admin, acronym: 'ADM' }],
    config: [{ status: GeneralStatus.Open }],
    cycle: { id: 1, start_date: '2024-01-01', end_date: '2024-12-31' },
    indicators: [],
    crp: null,
    token: 'mock-token',
    cycle_ended: false,
    crps: [],
    ...overrides,
  };
}

export function createMockAssessorUser(overrides: any = {}) {
  return createMockUser({
    roles: [{ description: Role.asesor, acronym: 'ASR' }],
    ...overrides,
  });
}

export function createMockCRPUser(overrides: any = {}) {
  return createMockUser({
    roles: [{ description: Role.crp, acronym: 'CRP' }],
    crp: { crp_id: 1, name: 'Test CRP', acronym: 'TCRP' },
    ...overrides,
  });
}

export function createMockActivatedRouteSnapshot(overrides: any = {}) {
  return {
    data: {},
    params: {},
    queryParams: {},
    url: [],
    ...overrides,
  };
}

export function createMockRouterStateSnapshot(url = '/dashboard') {
  return {
    url,
    toString: () => url,
  } as any;
}
