import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';

import { DashboardService } from '@services/dashboard.service';
import { AuthenticationService } from '@services/authentication.service';
import { AlertService } from '@services/alert.service';
import { CommentService } from 'src/app/services/comment.service';

import { User } from '@models/user.model';
import { GeneralIndicatorName } from '@models/general-status.model';

import { Title } from '@angular/platform-browser';
import { SortByPipe } from 'src/app/pipes/sort-by.pipe';

import moment from 'moment';
import { FormsModule } from '@angular/forms';
import { ExportTablesService } from 'src/app/services/export-tables.service';
import { CommonModule } from '@angular/common';
import { ResultsTableComponent } from '../../../../components/results-table/results-table.component';

export type UserResultsFilter = 'my_created' | 'my_submissions' | null;

@Component({
  selector: 'app-indicators',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, ResultsTableComponent],
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss'],
  providers: [SortByPipe]
})
export default class CRPIndicatorsComponent implements OnInit {
  indicatorType: string;
  indicatorTypeName: string;
  evaluationList: any[];
  returnedArray: any[];
  currentUser: User;
  /** Filter for CRP list: default to user's created results */
  userFilter: UserResultsFilter = 'my_created';

  // order: string = 'status';
  // reverse: boolean = false;

  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly dashService: DashboardService,
    private readonly authenticationService: AuthenticationService,
    private readonly commentService: CommentService,
    // private readonly orderPipe: SortByPipe,
    private readonly titleService: Title,
    private readonly alertService: AlertService,
    private readonly _exportTableSE: ExportTablesService
  ) {}

  ngOnInit() {
    this.activeRoute.params.subscribe(routeParams => {
      this.authenticationService.currentUser.subscribe(x => {
        this.currentUser = x;
      });

      this.indicatorType = routeParams['type'];
      this.indicatorTypeName = GeneralIndicatorName[`qa_${this.indicatorType}`];
      this.getEvaluationsList(routeParams);
      this.titleService.setTitle(`List of ${this.indicatorTypeName}`);
    });
  }

  listLoading = false;

  getEvaluationsList(params, filter?: UserResultsFilter) {
    this.listLoading = true;
    const filterType = filter ?? this.userFilter;
    this.dashService
      .geListDashboardEvaluations(
        this.currentUser.id,
        `qa_${params.type}`,
        params.primary_column,
        this.currentUser.crp?.crp_id,
        filterType ?? undefined
      )
      .subscribe({
        next: res => {
          this.evaluationList = res.data ?? [];
          this.returnedArray = this.evaluationList.slice(0, 10);
          this.listLoading = false;
        },
        error: error => {
          this.evaluationList = [];
          this.returnedArray = [];
          this.listLoading = false;
          this.alertService.error(error);
        }
      });
  }

  setUserFilter(filter: UserResultsFilter) {
    this.userFilter = filter;
    const routeParams = this.activeRoute.snapshot.params;
    this.getEvaluationsList(routeParams, filter);
  }

  /** True when list is empty and current filter is "my created" or "my submissions" */
  get showNoUserResultsMessage(): boolean {
    if (this.listLoading || !this.evaluationList) return false;
    if (this.evaluationList.length > 0) return false;
    return this.userFilter === 'my_created' || this.userFilter === 'my_submissions';
  }

  exportComments(item, all?) {
    console.log(item);
    let filename = `QA-${this.indicatorType.charAt(0).toUpperCase()}${this.indicatorType.charAt(1).toUpperCase()}${item ? '-' + item.id : ''}_${moment().format('YYYYMMDD_HHmm')}`;
    console.log('filename', filename);
    if (this.authenticationService.getBrowser() === 'Safari') filename += `.xlsx`;

    this.commentService
      .getCommentsExcel({
        evaluationId: item ? item.evaluation_id : undefined,
        id: this.currentUser.id,
        name: filename,
        indicatorName: `qa_${this.indicatorType}`,
        crp_id: all ? this.currentUser.crp.crp_id : undefined
      })
      .subscribe({
        next: (res: any) => {
          this._exportTableSE.exportExcel(res?.data, filename);
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  returnListName(indicator: string, type: 'header' | 'list'): string {
    const headerNames = {
      slo: 'Evidence on Progress towards SRF targets',
      default: `List of ${this.indicatorTypeName}`
    };

    const listNames = {
      slo: 'SLO target',
      milestones: 'Milestone statement',
      default: 'Title'
    };

    if (type === 'header') {
      return headerNames[indicator] || headerNames.default;
    } else if (type === 'list') {
      return listNames[indicator] || listNames.default;
    }

    return '';
  }
}
