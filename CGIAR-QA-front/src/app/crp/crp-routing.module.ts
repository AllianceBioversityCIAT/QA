import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../_helpers/auth.guard';
import { Role } from '../_models/roles.model';

import { CrpComponent } from './crp.component';
import { CrpDashboardComponent } from './crp-dashboard/crp-dashboard.component';
import { DetailIndicatorComponent } from './detail-indicator/detail-indicator.component';


const routes: Routes = [
  {
    path: '',
    component: CrpComponent,
    children: [
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        data: { roles: [Role.crp, Role.admin] },
        component: CrpDashboardComponent,
      },
      {
        path: 'indicator/:type/:primary_column',
        loadChildren: () => import('./detail-indicator/detail-indicator.module').then(mod => mod.DetailIndicatorModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CRPRoutingModule { }
