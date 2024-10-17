import { Component, OnInit, TemplateRef, ViewChild, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CommentService } from '@services/comment.service';
import { AuthenticationService } from '@services/authentication.service';
import { DashboardService } from '@services/dashboard.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AlertService } from '@services/alert.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { User } from '@models/user.model';
import { GeneralIndicatorName } from '@models/general-status.model';
import { Title } from '@angular/platform-browser';

import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { ExportTablesService } from '@services/export-tables.service';
import moment from 'moment';
import { IndicatorsService } from '@services/indicators.service';
import { CommonModule } from '@angular/common';
import { SortByPipe } from '../../../../pipes/sort-by.pipe';
import { StatusChartComponent } from './status-chart/status-chart.component';
import { CommentsChartComponent } from './comments-chart/comments-chart.component';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-crp-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule, SortByPipe, StatusChartComponent, CommentsChartComponent, NgxChartsModule],
  templateUrl: './crp-dashboard.component.html',
  styleUrls: ['./crp-dashboard.component.scss']
})
export default class CrpDashboardComponent implements OnInit {
  crp = null;
  dashboardData: any[];
  statusNames = { complete: 0, pending: 0 };
  indicators = [];
  statusChartData = {
    qa_impact_contribution: [],
    qa_other_outcome: [],
    qa_other_output: [],
    qa_capdev: [],
    qa_knowledge_product: [],
    qa_innovation_development: [],
    qa_policy_change: [],
    qa_innovation_use: [],
    qa_innovation_use_ipsr: []
  };
  totalPendings = {
    qa_impact_contribution: 0,
    qa_other_outcome: 0,
    qa_other_output: 0,
    qa_capdev: 0,
    qa_knowledge_product: 0,
    qa_innovation_development: 0,
    qa_policy_change: 0,
    qa_innovation_use: 0,
    qa_innovation_use_ipsr: 0
  };
  pendings = {
    qa_impact_contribution: 0,
    qa_other_outcome: 0,
    qa_other_output: 0,
    qa_capdev: 0,
    qa_knowledge_product: 0,
    qa_innovation_development: 0,
    qa_policy_change: 0,
    qa_innovation_use: 0,
    qa_innovation_use_ipsr: 0
  };
  dashboardCommentsData: any[];

  currentUser: User;
  indicatorsName = GeneralIndicatorName;

  dashboardModalData: any[];
  modalRef: BsModalRef;

  public barChartOptions: any = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end'
      }
    },
    onClick: this.graphClickEvent
  };
  barChartLabels: any;
  barChartType: ChartType = 'bar';
  barChartLegend = true;

  barChartData: ChartDataset[];

  has_comments: boolean = false;

  spinner1 = 'spinner1';
  spinner2 = 'spinner2';

  @ViewChild('crpChart') private crpChart: BaseChartDirective;

  multi = [];
  rawCommentsData = [];
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Indicator';
  showYAxisLabel: boolean = true;
  yAxisLabel: string = '# of comments';
  animations: boolean = true;

  colorScheme: string | Color = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    name: 'customScheme', // Add a name
    selectable: true, // Add selectable property
    group: ScaleType.Ordinal // Add group property
  };

  constructor(private activeRoute: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService, private modalService: BsModalService, private commentService: CommentService, private dashService: DashboardService, private alertService: AlertService, private titleService: Title, private spinner: NgxSpinnerService, private indicatorService: IndicatorsService, private _exportTableSE: ExportTablesService) {
    this.activeRoute.params.subscribe(routeParams => {
      this.authenticationService.currentUser.subscribe(x => {
        this.currentUser = x;

        this.getEvaluationsStats();
        this.getCommentStats();
      });
    });

    /** set page title */
    this.titleService.setTitle(`CRP Dashboard`);
  }

  ngOnInit() {
    this.indicators = JSON.parse(localStorage.getItem('indicators')) || [];
    if ((this.indicators = [])) this.getCRPIndicators();
  }

  getCRPIndicators() {
    if (!this.indicators.length && this.currentUser) {
      this.showSpinner(this.spinner1);
      this.indicatorService.getIndicators().subscribe(
        res => {
          this.indicators = res.data.sort((a, b) => a.order - b.order);
          localStorage.setItem('indicatorsCRP', JSON.stringify(this.indicators));
          this.hideSpinner(this.spinner1);
        },
        error => {
          this.hideSpinner(this.spinner1);
          this.alertService.error(error);
        }
      );
    }
  }

  getEvaluationsStats() {
    this.showSpinner(this.spinner2);
    this.dashService.getAllDashboardEvaluationsByCRP(this.currentUser.crp.crp_id).subscribe(
      res => {
        this.dashboardData = this.dashService.groupData(res.data);
        this.hideSpinner(this.spinner2);
      },
      error => {
        this.hideSpinner(this.spinner2);
        this.alertService.error(error);
      }
    );
  }

  getCommentStats() {
    this.showSpinner(this.spinner1);
    this.commentService.getCommentCRPStats({ crp_id: this.currentUser.crp.crp_id }).subscribe(
      res => {
        this.dashboardCommentsData = this.dashService.groupData(res.data);

        this.hideSpinner(this.spinner1);
      },
      error => {
        this.hideSpinner(this.spinner1);
        this.alertService.error(error);
      }
    );
  }

  getRawComments(crp_id?) {
    this.commentService.getRawComments({ crp_id }).subscribe(
      res => {
        this.rawCommentsData = res.data;
        Object.assign(this, { multi: this.groupCommentsChart(res.data) });
        this.has_comments = res.data.length > 0;
        this.hideSpinner(this.spinner1);
      },
      error => {
        this.hideSpinner(this.spinner1);
        this.alertService.error(error);
      }
    );
  }

  downloadRawComments() {
    this.showSpinner(this.spinner1);
    let crp_id = this.currentUser.crp['crp_id'];
    let filename = `QA-COMMENTS-${this.currentUser.crp.hasOwnProperty('acronym') && this.currentUser.crp['acronym'] !== 'All' ? '(' + this.currentUser.crp['acronym'] + ')' : ''}${moment().format('YYYYMMDD:HHmm')}`;
    if (this.authenticationService.getBrowser() === 'Safari') filename += `.xlsx`;

    this.commentService.getCommentsRawExcel(crp_id).subscribe(
      res => {
        console.log(res);
        this._exportTableSE.exportExcel(res, filename);
        this.hideSpinner(this.spinner1);
      },
      error => {
        this.hideSpinner(this.spinner1);
        this.alertService.error(error);
      }
    );
  }

  getPendingResponseComments(data) {
    let f = this.findObjectByKey(data, 'type', 'secondary');
    let resText = f ? `${f.comments_without_answer} not responde yet` : 'all responded';
    return resText;
  }

  findObjectByKey(array, key, value?) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][key] === value) {
        return array[i];
      }
    }
    return null;
  }

  _setCharData(response_data) {
    Object.assign(this, { barChartLabels: response_data.data.label });
    Object.assign(this, { barChartData: response_data.data.data_set });
  }

  groupCommentsChart(data) {
    let cp = Object.assign([], data),
      key = 'indicator_view_name',
      res = [];
    let groupedData = Object.assign([], this.dashService.groupByProp(cp, key));

    for (const iterator in groupedData) {
      let d = {
        name: groupedData[iterator][0].indicator_view_display,
        series: []
      };
      d.series.push(
        {
          name: 'Approved',
          value: groupedData[iterator].reduce((sum, current) => sum + parseInt(current.comment_approved), 0)
        },
        {
          name: 'Rejected',
          value: groupedData[iterator].reduce((sum, current) => sum + parseInt(current.comment_rejected), 0)
        }
      );

      res.push(d);
    }
    return res;
  }

  getIndicatorName(indicator: string) {
    return this.indicatorsName[indicator];
  }

  goToView(indicatorId, primary_column) {
    this.router.navigate([`crp/indicator/${indicatorId}/${primary_column}`]);
  }

  openModal(template: TemplateRef<any>) {
    this.dashboardModalData = [];
    this.getCommentStats();
    this.getRawComments(this.currentUser.crp.crp_id);
    this.modalRef = this.modalService.show(template);
  }

  formatStatusCharts() {
    const colors = {
      Answered: 'var(--color-agree)',
      pending: 'var(--color-pending)'
    };
    let dataset = [];
    let brushes = { domain: [] };
    for (const indicator in this.dashboardData) {
      if (this.dashboardData.hasOwnProperty.call(this.dashboardData, indicator)) {
        const indicatorArray = this.dashboardData[indicator];
        indicatorArray.forEach(element => {
          this.statusChartData[indicator].push({
            name: element.status == 'complete' ? 'Assessed' : element.status,
            value: +element.value
          });
        });
      }
    }
  }

  formatCommentsIndicatorData(data, indicator?) {
    const colors = {
      Accepted: 'var(--color-agree)',
      AcceptedWC: 'var(--color-agree-wc)',
      Disagree: 'var(--color-disagree)',
      Discarded: 'var(--color-pending-gray)',
      Pending: 'var(--color-pending)'
    };
    let dataset = [];
    let brushes = { domain: [] };

    if (data) {
      let comments_accepted_with_comment = data.find(item => item.comments_accepted_with_comment != '0');
      comments_accepted_with_comment = comments_accepted_with_comment ? { name: 'AcceptedWC', value: +comments_accepted_with_comment.value } : null;
      if (comments_accepted_with_comment) dataset.push(comments_accepted_with_comment);

      let comments_accepted_without_comment = data.find(item => item.comments_accepted_without_comment != '0');
      comments_accepted_without_comment = comments_accepted_without_comment ? { name: 'Accepted', value: +comments_accepted_without_comment.value } : null;
      if (comments_accepted_without_comment) dataset.push(comments_accepted_without_comment);

      let comments_rejected = data.find(item => item.comments_rejected != '0');
      comments_rejected = comments_rejected ? { name: 'Disagree', value: +comments_rejected.value } : null;
      if (comments_rejected) dataset.push(comments_rejected);

      let comments_discarded = data.find(item => item.comments_discarded != '0');
      comments_discarded = comments_discarded ? { name: 'Discarded', value: +comments_discarded.value } : null;
      if (comments_discarded) dataset.push(comments_discarded);

      let comments_without_answer = data.find(item => item.comments_without_answer != '0');
      comments_without_answer = comments_without_answer ? { name: 'Pending', value: +comments_without_answer.value } : null;

      if (comments_without_answer) {
        dataset.push(comments_without_answer);
        this.totalPendings[indicator] = +comments_without_answer.value;
      }

      let pending_tpb_decisions = data.find(item => {
        return item.pending_tpb_decisions != '0';
      });
      pending_tpb_decisions = pending_tpb_decisions
        ? {
            name: 'Pending_Tpb',
            value: +pending_tpb_decisions.pending_tpb_decisions
          }
        : null;

      if (pending_tpb_decisions) {
        this.pendings[indicator] = +pending_tpb_decisions.value;
      }

      dataset.forEach(comment => {
        brushes.domain.push(colors[comment.name]);
      });
    }

    return { dataset, brushes };
  }

  isDashboardDataEmpty(): boolean {
    return !this.dashboardData || Object.keys(this.dashboardData).length === 0;
  }

  loadData(): void {
    if (this.isDashboardDataEmpty()) {
      this.showSpinner('spinner-dashboard');
    }
  }

  goToPendingItems(indicator: string) {
    this.indicatorService.setOrderByStatus(false);
    this.router.navigate([`crp/indicator/${indicator.split('qa_')[1]}/id`]);
  }

  indicatorIsEnable(ind) {
    return ind ? this.indicators.find(indicator => indicator.view_name == ind)?.comment_meta.enable_crp : ind;
  }

  /***
   *
   *  Spinner
   *
   ***/
  showSpinner(name) {
    this.spinner.show(name);
  }
  hideSpinner(name) {
    this.spinner.hide(name);
  }

  /**
   *
   * Chart controllers
   */

  graphClickEvent(event, array) {}

  onSelect(data): void {
    let parsedData = JSON.parse(JSON.stringify(data));
    if (typeof parsedData === 'object') {
    }
  }

  onActivate(data): void {}

  onDeactivate(data): void {}
}
