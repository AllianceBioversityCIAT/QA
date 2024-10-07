import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { CacheService } from '../services/cache.service';
export const rolesGuard: CanMatchFn = (route, segments) => {
  const cache = inject(CacheService);
  console.log(cache.currentRole);

  const { roles } = (route.data as any) ?? ([] as any[]);
  console.log(roles);
  return roles.includes(cache.currentRole);
};
