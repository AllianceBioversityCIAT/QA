import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../_helpers/auth.guard';
import { Role } from '../_models/roles.model';

import { AssessorDashboardComponent } from './assesor-dashboard/assessor-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'asesor',
        canActivate: [AuthGuard],
        data: { roles: [Role.asesor] },
        component: AssessorDashboardComponent
      },
      {
        path: 'admin',
        canActivate: [AuthGuard],
        data: { roles: [Role.admin] },
        component: AdminDashboardComponent
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }