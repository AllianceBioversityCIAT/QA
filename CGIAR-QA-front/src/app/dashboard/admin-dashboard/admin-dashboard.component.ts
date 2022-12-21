import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { DashboardService } from "../../services/dashboard.service";
import { AuthenticationService } from "../../services/authentication.service";
import { AlertService } from '../../services/alert.service';
import { IndicatorsService } from '../../services/indicators.service';

import { User } from '../../_models/user.model';
import { CRP } from '../../_models/crp.model';
import { GeneralStatus, GeneralIndicatorName, TagMessage } from '../../_models/general-status.model';

import { Observable, forkJoin } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommentService } from 'src/app/services/comment.service';
import { Title } from '@angular/platform-browser';

import { saveAs } from "file-saver";

import { NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User;
  crps: CRP[];
  dashboardData: any[];
  dashboardModalData: any[];
  dashboardCommentsData: any[];
  dashboardCyclesData: any[];
  configurationData: any[];
  selectedProgramName: string;
  selectedProg: any = 'All';
  settingsForm: FormGroup;
  programsForm: FormGroup;
  generalStatus = GeneralStatus;
  indicatorsName = GeneralIndicatorName;

  assessorsChat = {
    isOpen: false,
    indicators: {
      qa_policies: false,
      qa_innovations: false,
      qa_publications: false,
      qa_oicr: false,
      qa_melia: false,
      // qa_capdev: false,
      qa_milestones: false,
      qa_slo: true,
      qa_outcomes: false,
      qa_capdev: false,
      qa_knowledge_product: false,
      qa_innovation_dev: false,
    }
  }

  indicator_status: string = 'indicators_status';

  indicatorsNameDropdwon = [
    { name: 'SLOs', viewname: 'qa_slo' },
    { name: 'Policies', viewname: 'qa_policies' },
    { name: 'OICRs', viewname: 'qa_oicr' },
    { name: 'Innovations', viewname: 'qa_innovations' },
    { name: 'Milestones', viewname: 'qa_milestones' },
    { name: 'Peer Reviewed Papers', viewname: 'qa_publications' },
    // { name: 'CapDevs', viewname: 'qa_capdev' },
    { name: 'MELIAs', viewname: 'qa_melia' },
    { name: 'Capacity Sharing Developmet', viewname: 'qa_capdev' },
    { name: 'Knowledge Product', viewname: 'qa_knowledge_product' },
    { name: 'innovation Development', viewname: 'qa_innovation_dev' },

    // qa_outcomes: 'Outcomes',
  ];

  activeCompleteDash = true;

  indicatorsAvailable;

  descriptionCharts = {
    generalStatus: "This shows the progress of assessment of a specific indicator. ",
    assessorsInteractions: "This presents assessors' interactions with existing comments on an item being already evaluated by other assessors. ",
    responseToComments: "This shows the status of Initiatives responses to comments made by assessors during the first round.",
    assessmentByField: "This shows the status of assessment for each field of an item.",
  }

  dataCharts = {
    generalStatus: null,
    assessorsInteractions: null,
    responseToComments: null,
    assessmentByField: null
  }

  totalPendings = {
    qa_policies: 0,
    qa_innovations: 0,
    qa_publications: 0,
    qa_oicr: 0,
    qa_melia: 0,
    qa_capdev: 0,
    qa_milestones: 0,
    qa_slo: 0
  }

  //new props
  tagMessages = TagMessage;
  indicatorsTags: any;
  selectedIndicator = 'qa_knowledge_product';
  dataSelected: any;
  indicatorData: any;
  feedList: [];
  itemStatusByIndicator = {};

  enableQATooltip: string = 'Enable the assessment process so Quality Assessors can start the process of providing recommendations. If this option is disabled, they cannot provide any comments.';
  enableCommentsTooltip: string = 'If this option is enabled, Initiatives will be able to see all comments provided by the Quality Assessors in PRMS Reporting tool; and also will be able to react to the comments.';

  modalRef: BsModalRef;
  multi = [];
  rawCommentsData = [];
  has_comments: boolean = false;
  has_comments_detailed: boolean = false;
  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Indicator';
  showYAxisLabel: boolean = true;
  yAxisLabel: string = '# of comments';
  animations: boolean = true;

  showSideMenu: boolean = false;

  colorScheme = {
    domain: ['#67be71', '#F1B7B7']
  };

  hoveredDate: NgbDate | null = null;

  fromDate: NgbDate | null;
  toDate: NgbDate | null;
  currenTcycle;

  isRound2 = true;

  constructor(private formBuilder: FormBuilder,
    private dashService: DashboardService,
    private modalService: BsModalService,
    private router: Router,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private spinner: NgxSpinnerService,
    private authenticationService: AuthenticationService,
    private indicatorService: IndicatorsService,
    private commentService: CommentService,
    private titleService: Title,
    private alertService: AlertService) {
    this.authenticationService.currentUser.subscribe(x => {
      this.currentUser = x;
    });

    /** set page title */
    this.titleService.setTitle(`Admin Dashboard`);

    /**
     * initialize forms
     */
    this.programsForm = this.formBuilder.group({
      program: ['0', Validators.required]
    });
    this.settingsForm = this.formBuilder.group({
      enableQA: this.formBuilder.array([], [Validators.required]),
      enableCRP: this.formBuilder.array([], [Validators.required]),
    })
    this.indicatorsAvailable = this.indicatorsNameDropdwon;
  }

  ngOnInit() {
    this.showSpinner()
    // console.log('USER',this.currentUser);

    this.loadDashData();


    //*****/ */

    // this.fromDate = this.calendar.getToday();
    // this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 10);
  }



  getIndicatorName(indicator: string) {
    return this.indicatorsName[indicator]
  }

  actualIndicator(indicator: string) {
    this.selectedIndicator = indicator;
    this.dataSelected = this.dashboardData[this.selectedIndicator];
    let crp_id = this.selectedProg.crp_id ? this.selectedProg.crp_id : undefined;
    this.showSpinner();

    let responses = forkJoin([
      this.getFeedTags(this.selectedIndicator),
      this.getItemStatusByIndicatorService(this.selectedIndicator, crp_id)
    ]);
    responses.subscribe(
      res => {
        const [feedTags, assessmentByField] = res;
        //feedTags
        this.feedList = feedTags.data;

        //assessmentByField
        this.itemStatusByIndicator = assessmentByField.data;

        //UPDATE CHARTS
        this.updateDataCharts();

        this.hideSpinner();
      }
    );
    // console.log(this.selectedIndicator, this.dashboardData[this.selectedIndicator]); 
  }

  actualChatIndicator(indicatorName: string) {
    for (const indicator in this.assessorsChat.indicators) {
      if (indicator != indicatorName) {
        this.assessorsChat.indicators[indicator] = false;
      } else {
        this.assessorsChat.indicators[indicator] = true;
      }
    }
  }

  actualStatusIndicator(data) {
    let indicator_status = false;
    // console.log(data);
    let i = 0;
    if (data) {
      for (const item of data) {
        if (item.indicator_status == 1) indicator_status = true;
        i++;
        // console.log(i);

      }
    }
    console.log('INDICATOR STATUS', indicator_status);

    return indicator_status;
  }

  // NEW
  getItemStatusByIndicator(indicator: string) {
    if (this.itemStatusByIndicator.hasOwnProperty(indicator)) {
      return this.itemStatusByIndicator[indicator];
    } else {
      return false;
    }
  }

  getAllItemStatusByIndicator(): Observable<any> {
    return this.indicatorService.getAllItemStatusByIndicator().pipe();
  }

  //Assessment by field and by indicator
  getItemStatusByIndicatorService(indicator: string, crp_id?: string): Observable<any> {
    return this.indicatorService.getItemStatusByIndicator(indicator, crp_id).pipe();
  }


  getAllTags(crp_id?): Observable<any> {
    return this.commentService.getAllTags(crp_id).pipe();
  }

  getFeedTags(indicator_view_name, tagTypeId?): Observable<any> {
    return this.commentService.getFeedTags(indicator_view_name, tagTypeId).pipe();
  }

  formatDateFeed(date: any) {
    let formatDate = moment(date).format("dddd, MMMM Do YYYY, HH:mm");;
    return formatDate;
  }

  formatStatusIndicatorData(data) {
    // DEFINE COLORS WITH CSS
    const colors = {
      complete: 'var(--color-complete)',
      pending: 'var(--color-pending)',
      finalized: 'var(--color-complete)',
      autochecked: 'var(--color-autochecked)'
    }
    let dataset = [];
    let brushes = { domain: [] };
    for (const item of data) {
      if (item.status != null) {
        dataset.push({ name: item.status, value: +item.label });
        brushes.domain.push(colors[item.status]);
      }
    }
    let complete = dataset.find(item => item.name == 'complete');
    if (complete) complete.name = 'Assessed 1st round';
    let finalized = dataset.find(item => item.name == 'finalized');
    if (finalized) finalized.name = 'Assessed 2nd round';

    let autochecked = dataset.find(item => item.name == 'autochecked');
    if (autochecked) {
      this.indicator_status = 'publications_status';
      autochecked.name = 'Automatically validated';
    } else {
      this.indicator_status = 'indicator_status';
    }
    // console.log('DATA SELECTED', { dataset, brushes });

    return { dataset, brushes };
  }

  formatCommentsIndicatorData(data, indicator?) {
    const colors = {
      Accepted: 'var(--color-agree)',
      AcceptedWC: 'var(--color-agree-wc)',
      Clarification: 'var(--color-clarification)',
      Disagree: 'var(--color-disagree)',
      Pending: 'var(--color-pending)'
    }
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

      let comments_clarification = data.find(item => item.comments_clarification != '0');
      comments_clarification = comments_clarification ? { name: 'Clarification', value: +comments_clarification.value } : null;
      if (comments_clarification) dataset.push(comments_clarification);

      let comments_without_answer = data.find(item => item.comments_without_answer != '0');
      comments_without_answer = comments_without_answer ? { name: 'Pending', value: +comments_without_answer.value } : null;
      if (comments_without_answer) {
        dataset.push(comments_without_answer);
        this.totalPendings[indicator] = +comments_without_answer.value;
      }

      dataset.forEach(comment => {
        brushes.domain.push(colors[comment.name]);
      });
    }

    return { dataset, brushes };
  }

  formatIndicatorTags() {

    const tags = this.indicatorsTags[this.selectedIndicator];

    const colors = {
      agree: 'var(--color-agree)',
      disagree: 'var(--color-disagree)',
      notsure: 'var(--color-not-sure)'
    }
    let dataset = [];
    let brushes = { domain: [] };
    for (const tag in tags) {
      dataset.push({ name: tag, value: tags[tag] })
    }
    dataset.forEach(tag => {
      brushes.domain.push(colors[tag.name]);
    });
    // console.log({ dataset, brushes });


    return { dataset, brushes };

  }


  isChecked(indicator, type) {
    return type === 'enableQA' ? indicator.enable_assessor : indicator.enable_crp;
    // return indicator.status === this.generalStatus.Open ? true : false;
  }

  updateConfig(type: string, id: number, isActive: boolean) {
    // let id = 
    let status = isActive ? this.generalStatus.Open : this.generalStatus.Close;
    // console.log(type, id, status);
    let request = null;
    // console.log(type, { enable_assessor: null, enable_crp: isActive })
    switch (type) {
      case 'enableQA':
        request = this.indicatorService.updateIndicatorsByUser(id, { enable: 'enable_assessor', isActive })
        console.log(type, { enable: 'enable_assessor', isActive })
        break;
      case 'enableCRP':
        request = this.indicatorService.updateIndicatorsByUser(id, { enable: 'enable_crp', isActive })
        console.log(type, { enable: 'enable_crp', isActive })
        break;

      default:
        break;
    }

    this.showSpinner();
    request.subscribe(
      res => {
        // console.log(res)
        // this.hideSpinner();
        this.loadDashData();
      },
      error => {
        this.hideSpinner()
        console.log("updateConfig", error);
        this.alertService.error(error);
      },
    );
  }


  onCheckboxChange(e, type) {
    const checkboxData: FormArray = this.settingsForm.get(type) as FormArray;

    if (e.target.checked) {
      checkboxData.push(new FormControl(e.target.value));
    } else {
      let i: number = 0;
      checkboxData.controls.forEach((item: FormControl) => {
        if (item.value == e.target.value) {
          checkboxData.removeAt(i);
          return;
        }
        i++;
      });
    }
    this.updateConfig(type, e.target.value, e.target.checked);
  }


  onProgramChange({ target }, value) {
    if (value)
      this.selectedProgramName = (value.acronym === '' || value.acronym === ' ') ? value.name : value.acronym;

    this.selectedProgramName = this.selectedProgramName ? this.selectedProgramName : 'All';
    let crp_id;
    if (!value) {
      this.selectedProg = 'All';
      crp_id = null;
    } else {
      crp_id = value.crp_id;
      this.selectedProg = value;
    }
    console.log(this.selectedProg, this.currenTcycle);

    this.showSpinner();

    if (this.currenTcycle.cycle_stage == "1") {
      let responses = forkJoin([
        this.getAllDashData(crp_id),
        this.getCommentStats(crp_id),
        this.getAllTags(crp_id),
        // this.getFeedTags(this.selectedIndicator),
        // this.getAllItemStatusByIndicator()
        this.getItemStatusByIndicatorService(this.selectedIndicator, crp_id)
      ]);

      responses.subscribe(res => {
        const [dashData, commentsStats, allTags, assessmentByField] = res;
        this.dashboardData = this.dashService.groupData(dashData.data);
        console.log('DASH DATA', this.dashboardData);
        console.log('DASH keys', Object.keys(this.dashboardData));
        this.selectedIndicator = Object.keys(this.dashboardData)[0];
        this.indicatorsAvailable = this.indicatorsNameDropdwon;
        this.indicatorsAvailable = this.indicatorsAvailable.filter(ind => ind.viewname in this.dashboardData);
        console.log('INDICATORS', this.indicatorsAvailable);


        this.dataSelected = this.dashboardData[this.selectedIndicator];

        this.dashboardCommentsData = this.dashService.groupData(commentsStats.data);
        console.log('RESPONSES', commentsStats.data);
        console.log('RESPONSES', this.dashboardCommentsData);


        this.indicatorsTags = this.commentService.groupTags(allTags.data);
        // this.feedList = feedTags.data;
        this.itemStatusByIndicator = assessmentByField.data;

        // this.itemStatusByIndicator = this.indicatorService.formatAllItemStatusByIndicator(assessmentByField.data);
        this.updateDataCharts();
        this.hideSpinner();
      }, error => {
        this.hideSpinner()
        console.log("getAllDashDataByCRP", error);
        this.alertService.error(error);
      });
    } else {
      let responses = forkJoin([
        this.getAllDashData(crp_id),
        this.getCommentStats(crp_id),
        this.getAllTags(crp_id),
        // this.getFeedTags(this.selectedIndicator),
        // this.getAllItemStatusByIndicator()
        this.getItemStatusByIndicatorService(this.selectedIndicator, crp_id)
      ]);

      responses.subscribe(res => {
        const [dashData, commentsStats, allTags, assessmentByField] = res;
        this.dashboardData = this.dashService.groupData(dashData.data);
        console.log('DASH DATA', this.dashboardData);
        this.selectedIndicator = Object.keys(this.dashboardData)[0];
        console.log('DASH DATA', this.selectedIndicator);
        this.indicatorsAvailable = this.indicatorsNameDropdwon;
        this.indicatorsAvailable = this.indicatorsAvailable.filter(ind => ind.viewname in this.dashboardData);
        console.log('INDICATORS', this.indicatorsAvailable);


        this.dataSelected = this.dashboardData[this.selectedIndicator];
        this.dashboardCommentsData = this.dashService.groupData(commentsStats.data);
        this.indicatorsTags = this.commentService.groupTags(allTags.data);
        // this.feedList = feedTags.data;
        this.itemStatusByIndicator = assessmentByField.data;

        // this.itemStatusByIndicator = this.indicatorService.formatAllItemStatusByIndicator(assessmentByField.data);
        this.updateDataCharts();
        this.hideSpinner();
      }, error => {
        this.hideSpinner()
        console.log("getAllDashDataByCRP", error);
        this.alertService.error(error);
      });
    }

  }

  goToView(view: string, primary_column: string) {
    this.router.navigate(['indicator', view.toLocaleLowerCase(), primary_column]);
    // this.router.navigate(['/reload']).then(() => { this.router.navigate(['indicator', view.toLocaleLowerCase(), primary_column]); });
  }

  getPendings(data) {
    return data.acronym === 'All' ? '' : '- ' + (data.qa_active === this.generalStatus.Open ? 'Open' : 'Pending')
  }

  loadDashData() {
    this.showSpinner()

    let responses = forkJoin([
      this.getAllDashData(),
      this.getAllCRP(),
      this.getIndicatorsByCRP(),
      this.getCommentStats(),
      this.getCycles(),
      this.getAllTags(),
      this.getFeedTags(this.selectedIndicator),
      this.getItemStatusByIndicatorService(this.selectedIndicator)
    ]);
    responses.subscribe(res => {
      const [dashData, crps, indicatorsByCrps, commentsStats, cycleData, allTags, feedTags, assessmentByField] = res;

      this.dashboardData = this.dashService.groupData(dashData.data);
      // this.selectedIndicator = Object.keys(this.dashboardData)[1];
      this.dataSelected = this.dashboardData[this.selectedIndicator];
      // console.log(res)

      this.crps = crps.data;
      // this.crps.unshift(new CRP( 0, 'All', 'undefined',  '0', false ) )
      // this.selectedProgramName = this.crps[0]['acronym'];
      this.selectedProgramName = 'All';
      console.log('PROGRAM NAME', this.selectedProgramName);

      this.configurationData = indicatorsByCrps.data;
      // console.log(this.configurationData)

      // console.log(commentsStats)
      this.dashboardCommentsData = this.dashService.groupData(commentsStats.data);
      // console.log(this.dashboardCommentsData)

      this.dashboardCyclesData = this.parseCycleDates(cycleData.data);
      // console.log(this.currenTcycle, this.fromDate, this.toDate)

      this.indicatorsTags = this.commentService.groupTags(allTags.data);;

      this.feedList = feedTags.data;

      this.itemStatusByIndicator = assessmentByField.data;

      // this.itemStatusByIndicator = this.indicatorService.formatAllItemStatusByIndicator(assessmentByField.data);
      // console.log('CHART 3',this.itemStatusByIndicator);

      //UPDATE CHARTS
      this.updateDataCharts();

      this.hideSpinner();
    }, error => {
      this.hideSpinner()
      console.log("getAllDashData", error);
      this.alertService.error(error);
    })

  }

  updateDataCharts() {
    this.dataCharts.generalStatus = this.formatStatusIndicatorData(this.dataSelected);
    this.dataCharts.assessorsInteractions = this.formatIndicatorTags();
    this.dataCharts.responseToComments = this.formatCommentsIndicatorData(this.dashboardCommentsData[this.selectedIndicator], this.selectedIndicator);
    this.dataCharts.assessmentByField = this.itemStatusByIndicator;

    // this.dataCharts.assessmentByField = this.getItemStatusByIndicator(this.selectedIndicator);

  }

  updateFeedTags(tagTypeId) {
    this.getFeedTags(this.selectedIndicator, tagTypeId).subscribe(
      res => {
        this.feedList = res.data;
        this.hideSpinner();
      }
    )
  }


  /**
   * 
   * 
   * GET DASHBOARD data
   * 
   */
  // all evaluations
  getAllDashData(crp_id?): Observable<any> {
    return this.dashService.getAllDashboardEvaluations(crp_id).pipe();
  }

  // all active CRPS
  getAllCRP(): Observable<any> {
    return this.dashService.getCRPS().pipe();
  }

  // indicators by CRPS
  getIndicatorsByCRP(): Observable<any> {
    return this.dashService.getIndicatorsByCRP().pipe();
  }

  // comments by crp
  getCommentStats(crp_id?) {
    // this.showSpinner();

    return this.commentService.getCommentCRPStats({ crp_id, id: null }).pipe();
  }

  // comments raw data
  getRawComments(crp_id?) {
    // console.log('asd', crp_id)
    this.showSpinner()
    this.commentService.getRawComments({ crp_id })
      .subscribe(
        res => {
          // console.log('getRawComments', this.groupCommentsChart(res.data))
          this.rawCommentsData = res.data;
          Object.assign(this, { multi: this.groupCommentsChart(res.data) });
          this.has_comments = (res.data.length > 0);
          this.hideSpinner();
        },
        error => {
          this.hideSpinner()
          console.log("getRawComments", error);
          this.alertService.error(error);
        },
      )
  }

  // cycles data
  getCycles() {
    return this.commentService.getCycles().pipe();
  }

  setCycle(params) {
    return this.commentService.updateCycle(params).pipe();
  }


  /***
   * 
   *  Spinner 
   * 
   ***/
  showSpinner() {
    this.spinner.show();
  }
  hideSpinner() {
    this.spinner.hide();
  }


  /***
   * 
   * 
   */

  openModal(template: TemplateRef<any>) {
    // this.dashboardModalData = []
    // this.getCommentStats()
    this.getRawComments(this.selectedProg['crp_id']);
    this.modalRef = this.modalService.show(template);
  }

  updateCycle() {
    let copyCurrenCycle = Object.assign({}, this.currenTcycle);
    copyCurrenCycle.start_date = this.formatDate(this.currenTcycle.start_date)['format']("YYYY-MM-DDT00:00:00.000Z");
    copyCurrenCycle.end_date = this.formatDate(this.currenTcycle.end_date)['format']("YYYY-MM-DDT23:59:00.000Z");
    // console.log(this.currenTcycle, copyCurrenCycle)
    this.showSpinner()
    this.setCycle(copyCurrenCycle).subscribe(
      res => {
        console.log(res);
        this.getCycles().subscribe(res => {
          this.dashboardCyclesData = this.parseCycleDates(res.data);
          this.hideSpinner()
        }, error => {
          this.hideSpinner()
          console.log("updateCycle getCycles", error);
          this.alertService.error(error);
        })
        this.hideSpinner()
      }, error => {
        this.hideSpinner()
        console.log("updateCycle", error);
        this.alertService.error(error);
      }
    )
  }

  //TO-DO
  downloadRawComments() {
    this.showSpinner();
    // console.log(this.selectedProg)
    let crp_id = this.selectedProg['crp_id'];
    console.log(this.selectedProg);

    let filename = `QA-COMMENTS-${this.selectedProg.hasOwnProperty('acronym') && this.selectedProg['acronym'] !== 'All' ? '(' + this.selectedProg['acronym'] + ')' : ''}${moment().format('YYYYMMDD:HHmm')}`
    if (this.authenticationService.getBrowser() === 'Safari')
      filename += `.xlsx`;

    this.commentService.getCommentsRawExcel(crp_id).subscribe(
      res => {
        // console.log(res)
        let blob = new Blob([res], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8" });
        saveAs(blob, filename);
        this.hideSpinner();
      },
      error => {
        console.log("downloadRawComments", error);
        this.hideSpinner();
        this.alertService.error(error);
      }
    )
  }


  goToPDF(type: string) {
    let pdf_url;
    switch (type) {
      case 'AR':
        pdf_url = this.currentUser.config[0]["anual_report_guideline"];
        break;
      case 'ASSESSORS_GUIDANCE':
        pdf_url = this.currentUser.config[0][`assessors_guideline`];
        break;
      default:

        break;
    }
    window.open(pdf_url, "_blank");
  }








  /**
   * 
   * date picker 
   * 
   */

  parseCycleDates(data) {

    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      let strDt = moment(element.start_date);
      let endDt = moment(element.end_date);
      element.start_date = { year: strDt.format('YYYY'), month: strDt.format('MM'), day: strDt.format('DD') };
      element.end_date = { year: endDt.format('YYYY'), month: endDt.format('MM'), day: endDt.format('DD') };

      element.is_active = (moment().isAfter(strDt, 'day') && moment().isBefore(endDt, 'day'));
      if (element.is_active) {
        this.fromDate = element.start_date;
        this.toDate = element.end_date;
        this.currenTcycle = element;
        // this.currenTcycle = Object.assign({}, element);
      }
    }

    return data;
  }
  formatDate(date: NgbDate) {
    if (date) {
      // NgbDates use 1 for Jan, Moement uses 0, must substract 1 month for proper date conversion
      var ngbObj = JSON.parse(JSON.stringify(date));
      var newMoment = moment();
      if (ngbObj) {
        ngbObj.month--;
        newMoment.month(ngbObj.month);
        newMoment.dates(ngbObj.day);
        newMoment.year(ngbObj.year);
      }

      // Convert date to "Mon Feb 01" format
      if (newMoment.isValid()) {
        return newMoment;
        // return newMoment.format('ddd MMM DD');
      } else {
        return '';
      }

    }

  }

  groupCommentsChart(data) {
    let cp = Object.assign([], data), key = 'indicator_view_name', res = [];
    let groupedData = Object.assign([], this.dashService.groupByProp(cp, key));

    for (const iterator in groupedData) {
      // console.log(groupedData[iterator], iterator)
      let d = {
        name: groupedData[iterator][0].indicator_view_display,
        series: []
      }
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


      res.push(d)
    }
    return res;
  }


  onDateSelection(date: NgbDate) {
    // console.log(date)
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }

    this.currenTcycle.start_date = this.fromDate ? this.fromDate : this.currenTcycle.start_date;
    this.currenTcycle.end_date = this.toDate ? this.toDate : this.currenTcycle.end_date;
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  validateNewDate() {
    let endDate = this.formatDate(this.toDate);
    // let currDb = this.dashboardCyclesData.find(cycle => cycle.id == this.currenTcycle.id);
    // let isDiff = currDb.start_date !== this.fromDate && currDb.end_date !== this.toDate;
    // console.log(isDiff, this.currenTcycle, currDb)
    return this.fromDate && moment().isBefore(endDate, 'day');
    // return false;
  }



  /**
   * 
   * Chart controllers
   */


  onSelect(data): void {
    let parsedData = JSON.parse(JSON.stringify(data))
    if (typeof parsedData === 'object') {
      // console.log('Item clicked', parsedData);
      // this.has_comments_detailed = true;
      // this.has_comments = false;
    }
  }

  onActivate(data): void {
    // console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    // console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }


  toggleAssessorsChat() {
    this.assessorsChat.isOpen = !this.assessorsChat.isOpen;
  }
  toggleSideMenu() {
    this.showSideMenu = !this.showSideMenu;
  }

  // axisFormat(val) {
  //   if (val % 1 === 0) {
  //     return val.toLocaleString();
  //   } else {
  //     return '';
  //   }
  // }

  openChart(template: TemplateRef<any>, e) {
    // console.log(e.clientY)


    // template.elementRef.nativeElement.style.top = `${this.currentY}px`;
    this.modalRef = this.modalService.show(template, { class: 'modal-xl' });

    // const modal = this.elem.nativeElement.querySelector('.modal-content');
    // console.log(modal);
    // console.log(template.elementRef.nativeElement);

    // template.elementRef.nativeElement.style.top.px = this.currentY;
    // this.confirmModal.nativeElement.style.top = `${this.currentY}px`;
  }





}
