import { Routes } from '@angular/router';
import { rolesGuard } from './guards/roles.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/assesor-dashboard/assesor-dashboard.component'),
    canMatch: [rolesGuard],
    data: {
      roles: [2]
    }
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component'),
    canMatch: [rolesGuard],
    data: {
      roles: [1]
    }
  },
  {
    path: 'crp',
    loadComponent: () => import('./pages/crp/crp.component')
  },
  {
    path: 'indicator/:type/:primary_column',
    loadComponent: () => import('./pages/indicator/indicator.component')
  },
  { path: 'qa-close', loadComponent: () => import('./pages/qa-close/qa-close.component') },
  { path: 'login', loadComponent: () => import('./pages/login/login.component') },
  { path: 'assessors-chat', loadComponent: () => import('./pages/assessors-chat/assessors-chat.component') },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // otherwise redirect to home
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component') }
];
