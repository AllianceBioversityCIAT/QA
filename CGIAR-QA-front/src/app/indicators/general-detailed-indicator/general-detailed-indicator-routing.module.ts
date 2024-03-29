import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../_helpers/auth.guard';
import { Role } from '../../_models/roles.model';

import { GeneralDetailedIndicatorComponent } from './general-detailed-indicator.component';
import { CommentComponent } from '../../comment/comment.component';


const routes: Routes = [
    {
        path: '',
        component: GeneralDetailedIndicatorComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.asesor, Role.admin] },

    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GeneralDetailedIndicatorRoutingModule { }

