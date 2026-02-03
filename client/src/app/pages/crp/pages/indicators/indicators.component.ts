import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

import { DashboardService } from '@services/dashboard.service';
import { AuthenticationService } from '@services/authentication.service';
import { CommentService } from '@services/comment.service';
import { AlertService } from '@services/alert.service';

import { User } from '@models/user.model';
import { GeneralIndicatorName } from '@models/general-status.model';
import { ExportTablesService } from '@services/export-tables.service';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { SortByPipe } from '@pipes/sort-by.pipe';

import moment from 'moment';
import { FormBuilder, FormsModule } from '@angular/forms';

import { EvaluationsService } from '@services/evaluations.service';
import { CommonModule } from '@angular/common';
import { ResultsTableComponent } from '../../../../components/results-table/results-table.component';

interface CommentExcelResponse {
  data: Array<{
    "Init short name": string;
    "Result code": string;
    "Result title": string;
    "Year": string;
    "Evaluation ID": number;
    "Field name": string;
    "Field value 2023": string;
    "Comment 2023": string;
    "Created date": string;
    "Assessor username": string;
    "Assessor email": string;
    "Init reply type": string;
    "Init reply": string;
    "Reply created date": string;
    "Init user": string;
    "Round": string;
  }>;
  status: number;
  description: string;
  timestamp: string;
  path: string;
}

@Component({
  selector: 'app-indicators',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, NgxSpinnerModule, ResultsTableComponent],
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss'],
  providers: [SortByPipe]
})
export default class IndicatorsComponent implements OnInit {
  indicatorType: string;
  indicatorTypeName: string;
  evaluationList: any[];
  returnedArray: any[];
  currentUser: User;

  indicatorTypePage = null;
  // collectionSize = 0;
  // uncheckableRadioModel = '';

  // hasTemplate = false;

  order: string = 'status';
  reverse: boolean = false;
  chatRooms = null;

  criteriaData;
  criteria_loading = false;

  submission_dates: any[] = [];
  selectedDates = [];
  listLoading = false;

  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly dashService: DashboardService,
    private readonly authenticationService: AuthenticationService,
    private readonly commentService: CommentService,
    private readonly formBuilder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly orderPipe: SortByPipe,
    private readonly sanitizer: DomSanitizer,
    private readonly evaluationService: EvaluationsService,
    private readonly titleService: Title,
    private readonly alertService: AlertService,
    private readonly _exportTableSE: ExportTablesService
  ) {
    this.getBatchDates();

    this.activeRoute.params.subscribe(routeParams => {
      this.authenticationService.currentUser.subscribe(x => {
        this.currentUser = x;
      });

      this.indicatorType = routeParams['type'];
      this.indicatorTypePage = null;

      this.indicatorTypeName = GeneralIndicatorName[`qa_${this.indicatorType}`];

      this.getEvaluationsList(routeParams);
      this.getIndicatorCriteria(`qa_${routeParams['type']}`);

      this.titleService.setTitle(`List of ${this.indicatorTypeName}`);
    });
  }

  ngOnInit() {
    if (this.indicatorType == 'slo') {
      this.order = 'status';
    }

    this.chatRooms = {
      general: this.sanitizer.bypassSecurityTrustResourceUrl(`https://deadsimplechat.com/am16H1Vlj?username=${this.currentUser.name}`)
    };
  }

  getBatchDates() {
    this.commentService.getBatches().subscribe({
      next: res => {
        const batches = res.data;
        for (let index = 0; index < batches.length; index++) {
          let batch = {
            date: moment(batches[index].submission_date).format('ll'),
            batch_name: +batches[index].batch_name,
            checked: false,
            is_active: null
          };
          batch.is_active = !!(moment(Date.now()).isSameOrAfter(batch.date) || index === 0);
          batch.checked = batch.batch_name == 3;
          this.submission_dates.push(batch);
        }
        this.selectedDates = this.submission_dates.filter(date => date.checked).map(date => date.date);
      },
      error: error => {
        this.alertService.error(error);
        console.log(error);
      }
    });
  }

  getIndicatorCriteria(id) {
    this.criteria_loading = true;
    this.evaluationService.getCriteriaByIndicator(id).subscribe({
      next: res => {
        this.criteriaData = res.data[0];

        this.criteria_loading = false;
      },
      error: error => {
        this.criteria_loading = false;
        this.alertService.error(error);
      }
    });
  }

  getEvaluationsList(params) {
    this.listLoading = true;
    this.showSpinner();

    this.dashService.geListDashboardEvaluations(this.currentUser.id, `qa_${params.type}`, params.primary_column).subscribe({
      next: res => {
        this.order = 'status';
        this.evaluationList = res.data;
        this.evaluationList.forEach(evaluation => {
          evaluation.full_title = evaluation.initiative + ' - ' + evaluation.short_name;
        });
        this.returnedArray = this.evaluationList.slice(0, 10);
        this.listLoading = false;
        this.hideSpinner();
      },
      error: error => {
        this.listLoading = false;
        this.hideSpinner();
        this.returnedArray = [];
        this.alertService.error(error);
      }
    });
  }

  exportComments(item) {
    this.showSpinner();
    let filename = `QA-${this.indicatorType.charAt(0).toUpperCase()}${this.indicatorType.charAt(1).toUpperCase()}-${item.id}_${moment().format('YYYYMMDD_HHmm')}`;
    if (this.authenticationService.getBrowser() === 'Safari') filename += `.xlsx`;
    this.commentService
      .getCommentsExcel({
        evaluationId: item.evaluation_id,
        id: this.currentUser.id,
        name: filename,
        indicatorName: `qa_${this.indicatorType}`
      })
      .subscribe({
        next: (res: CommentExcelResponse) => {
          this._exportTableSE.exportExcel(res.data, filename);
          this.hideSpinner();
        },
        error: error => {
          this.hideSpinner();
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

  showSpinner() {
    this.spinner.show();
  }
  hideSpinner() {
    this.spinner.hide();
  }
}
