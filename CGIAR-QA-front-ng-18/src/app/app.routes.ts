import { Routes } from '@angular/router';
import { rolesGuard } from './guards/roles.guard';

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
    loadComponent: () => import('./pages/crp/crp.component')
    // children: [
    // {
    // path: 'dashboard',
    // loadComponent: () => import('./pages/crp-dashboard/crp-dashboard.component')
    // canActivate: [AuthGuard],
    // data: { roles: [Role.crp, Role.admin] },
    // component: CrpDashboardComponent,
    // }
    //   {
    //     path: 'indicator/:type/:primary_column',
    //     loadComponent: () => import('./pages/detail-indicator/detail-indicator.component'),
    // children:[
    //   {
    //     path: '',
    //     canActivate: [AuthGuard],
    //     data: { roles: [Role.crp, Role.admin] },
    //     component: CRPIndicatorsComponent,
    // },
    // {
    //     path: 'detail/:indicatorId',
    //     component: DetailIndicatorComponent
    // },
    // ]
    //   }
    // ]
  },
  {
    path: 'indicator/:type/:primary_column',
    loadComponent: () => import('./pages/indicator/indicator.component')
    // children: [
    //   {
    //     path: '',
    //     component: IndicatorsComponent,
    //     canActivate: [AuthGuard, AvailableGuard],
    //     data: { roles: [Role.asesor, Role.admin] },
    //     // pathMatch: 'full'
    // },
    // {
    //     path: 'detail/:indicatorId',
    //     loadChildren: () => import('./general-detailed-indicator/general-detailed-indicator.module').then(mod => mod.GeneralDetailedIndicatorModule),
    //     children: [
    //       {
    //         path: '',
    //         component: GeneralDetailedIndicatorComponent,
    //         canActivate: [AuthGuard],
    //         data: { roles: [Role.asesor, Role.admin] },

    //     },
    //     ]
    // }
    // ]
  },
  { path: 'qa-close', loadComponent: () => import('./pages/qa-close/qa-close.component') },
  { path: 'login', loadComponent: () => import('./pages/login/login.component') },
  { path: 'assessors-chat', loadComponent: () => import('./pages/assessors-chat/assessors-chat.component') },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // otherwise redirect to home
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component') }
];
