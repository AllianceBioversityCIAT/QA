import { Routes } from '@angular/router';

export const routes: Routes = [
  // {
  //   path: '',
  //   loadComponent: () => import('./pages/core/core.component'),
  //   children: [
  //     {
  //       path: '',
  //       redirectTo: 'sites-slider',
  //       pathMatch: 'full'
  //     },
  //     {
  //       path: 'sites-slider',
  //       loadComponent: () => import('./pages/core/pages/sites-slider/sites-slider.component')
  //     },
  //     {
  //       path: 'sites-list',
  //       loadComponent: () => import('./pages/core/pages/sites-list/sites-list.component')
  //     },
  //     {
  //       path: 'settings',
  //       loadComponent: () => import('./pages/core/pages/settings/settings.component')
  //     }
  //   ]
  // }
  {
    path: '',
    loadComponent: () => import('./pages/login/login.component')
  }
  // {
  //   path: 'fields',
  //   loadComponent: () => import('./pages/dynamic-fields/dynamic-fields.component')
  // },
  // {
  //   path: '**',
  //   redirectTo: 'not-found',
  //   pathMatch: 'full'
  // }
];
