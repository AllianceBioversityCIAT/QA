import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { IndicatorsRoutingModule } from './indicators-routing.module';
import { IndicatorsComponent } from './indicators.component';

import { NgxSpinnerModule } from "ngx-spinner";
import { OrderModule } from 'ngx-order-pipe';
import { CommentComponentModule } from '../comment/comment.module';
import { SharedModule } from '../shared-module/shared-module.module';
import { MarkdownModule } from 'ngx-markdown';

import { AssessorsChatWindowComponent } from '../_shared/assessors-chat-window/assessors-chat-window.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
// import { CustomFilterPipe } from '../pipes/custom-filter.pipe';
// import { CommentComponent } from '../comment/comment.component';
// import { GeneralDetailedIndicatorComponent } from './general-detailed-indicator/general-detailed-indicator.component';



@NgModule({
    imports: [
        CommonModule,
        IndicatorsRoutingModule,
        ProgressbarModule.forRoot(),
        ButtonsModule.forRoot(),
        CollapseModule.forRoot(),
        PaginationModule.forRoot(),
        MarkdownModule.forRoot(),
        NgxSpinnerModule,
        OrderModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        Ng2SearchPipeModule,
        CommentComponentModule,
        
    ],
    declarations: [IndicatorsComponent]
})
export class IndicatorsModule { }
