import { Routes } from '@angular/router';
import { rolesGuard } from './guards/roles.guard';
import { AuthGuard } from '@helpers/auth.guard';
import { Role } from '@models/roles.model';
import CrpDashboardComponent from '@pages/crp/pages/crp-dashboard/crp-dashboard.component';
import { AvailableGuard } from './_helpers/available.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/assesor-dashboard/assessor-dashboard.component'),
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
    loadComponent: () => import('./pages/crp/crp.component'),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('@pages/crp/pages/crp-dashboard/crp-dashboard.component'),
        canActivate: [AuthGuard],
        data: { roles: [Role.crp, Role.admin] }
      },
      {
        path: 'indicator/:type/:primary_column',
        loadComponent: () => import('@pages/crp/pages/detail-indicator/detail-indicator.component'),
        children: [
          {
            path: '',
            canActivate: [AuthGuard],
            data: { roles: [Role.crp, Role.admin] },
            loadComponent: () => import('@pages/crp/pages/crp-indicators/indicators.component')
          },
          {
            path: 'detail/:indicatorId',
            loadComponent: () =>
              import('@pages/crp/pages/detail-indicator/detail-indicator.component')
          }
        ]
      }
    ]
  },
  {
    path: 'indicator/:type/:primary_column',
    loadComponent: () => import('@pages/crp/pages/crp-indicators/indicators.component'),
    canActivate: [AuthGuard, AvailableGuard],
    data: { roles: [Role.asesor, Role.admin] }
  },
  // {
  //   path: 'indicator/:type/:primary_column/detail/:indicatorId',
  //   loadComponent: () => import('@pages/crp/pages/crp-indicators/indicators.component'),
  //   canActivate: [AuthGuard],
  //   data: { roles: [Role.asesor, Role.admin] }
  // },
  // {
  //   path: 'indicator/:type/:primary_column',
  //   loadComponent: () => import('./pages/indicator/indicator.component'),
  //   children: [
  //     {
  //       // path: '',
  //       loadComponent: () => import('@pages/crp/pages/crp-indicators/indicators.component'),
  //       canActivate: [AuthGuard, AvailableGuard],
  //       data: { roles: [Role.asesor, Role.admin] },
  //       pathMatch: 'full'
  //     }
  //     // {
  //     //     path: 'detail/:indicatorId',
  //     //     loadChildren: () => import('./general-detailed-indicator/general-detailed-indicator.module').then(mod => mod.GeneralDetailedIndicatorModule),
  //     //     children: [
  //     //       {
  //     //         path: '',
  //     //         component: GeneralDetailedIndicatorComponent,
  //     //         canActivate: [AuthGuard],
  //     //         data: { roles: [Role.asesor, Role.admin] },

  //     //     },
  //     //     ]
  //     // }
  //   ]
  // },
  { path: 'qa-close', loadComponent: () => import('./pages/qa-close/qa-close.component') },
  { path: 'login', loadComponent: () => import('./pages/login/login.component') },
  {
    path: 'assessors-chat',
    loadComponent: () => import('./pages/assessors-chat/assessors-chat.component')
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // otherwise redirect to home
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component') }
];
