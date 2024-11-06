import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { CacheService } from '../services/cache.service';
export const rolesGuard: CanMatchFn = (route, segments) => {
  const cache = inject(CacheService);
  const { roles } = (route.data as any) ?? ([] as any[]);
  return roles.includes(cache.currentRole);
};
