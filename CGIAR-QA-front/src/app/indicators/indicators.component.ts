import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { NgxSpinnerService } from "ngx-spinner";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { OrderPipe } from "ngx-order-pipe";

import { DashboardService } from "../services/dashboard.service";
import { AuthenticationService } from "../services/authentication.service";
import { CommentService } from "../services/comment.service";
import { AlertService } from "../services/alert.service";

import { User } from "../_models/user.model";
import {
  DetailedStatus,
  GeneralIndicatorName,
  StatusIcon,
} from "../_models/general-status.model";
import { ExportTablesService } from "../services/export-tables.service";
import { Title } from "@angular/platform-browser";
import { SortByPipe } from "../pipes/sort-by.pipe";

import * as moment from "moment";
import { FormBuilder } from "@angular/forms";
import { IndicatorsService } from "../services/indicators.service";

import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import { EvaluationsService } from "../services/evaluations.service";
@Component({
  selector: "app-indicators",
  templateUrl: "./indicators.component.html",
  styleUrls: ["./indicators.component.scss"],
  providers: [SortByPipe],
})
export class IndicatorsComponent implements OnInit {
  indicatorType: string;
  indicatorTypeName: string;
  evaluationList: any[];
  returnedArray: any[];
  returnedArrayHasStage: boolean;
  currentUser: User;

  currentPageList = {
    startItem: 0,
    endItem: 10,
  };
  currentPage = {
    qa_impact_contribution: 1,
    qa_other_outcome: 1,
    qa_other_output: 1,
    qa_capdev: 1,
    qa_knowledge_product: 1,
    qa_innovation_development: 1,
    qa_policy_change: 1,
    qa_innovation_use: 1,
    qa_innovation_use_ipsr: 1,
  };
  stageHeaderText = {
    policies: "Stage",
    oicr: "Maturity Stage",
    innovations: "Stage",
    melia: "Type",
    publications: "ISI",
    milestones: "Milestone Status",
  };
  indicatorTypePage = null;
  maxSize = 5;
  pageSize = 4;
  collectionSize = 0;
  searchText;
  evalStatusFilter = "";
  rsaFilter: boolean = false;
  // uncheckableRadioModel = '';

  hasTemplate = false;

  notProviedText = "<No provided>";

  order: string = "status";
  configTemplate: string;
  reverse: boolean = false;
  btonFilterForm: any;
  chatRooms = null;

  assessorsChat = {
    isOpen: false,
  };

  detailedStatus = DetailedStatus;
  statusIcon = StatusIcon;
  criteriaData;
  criteria_loading = false;

  submission_dates: any[] = [];
  showAcceptedComments = false;
  showDisagreedComments = false;
  showHighlightedComments = false;
  showTpbComments = false;
  showImplementedDecisions = false;
  showActionArea = true;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private dashService: DashboardService,
    private authenticationService: AuthenticationService,
    private commentService: CommentService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private orderPipe: SortByPipe,
    private indicatorService: IndicatorsService,
    private sanitizer: DomSanitizer,
    private evaluationService: EvaluationsService,
    private titleService: Title,
    private alertService: AlertService,
    private _exportTableSE: ExportTablesService
  ) {
    this.getBatchDates();

    this.activeRoute.params.subscribe((routeParams) => {
      this.authenticationService.currentUser.subscribe((x) => {
        this.currentUser = x;
      });

      this.indicatorType = routeParams.type;
      this.indicatorTypePage = null;

      this.configTemplate =
        this.currentUser.config[`${this.indicatorType}_guideline`];
      this.indicatorTypeName = GeneralIndicatorName[`qa_${this.indicatorType}`];

      this.getEvaluationsList(routeParams);
      this.getIndicatorCriteria(`qa_${routeParams.type}`);

      this.btonFilterForm = this.formBuilder.group({
        radio: "A",
      });
      this.titleService.setTitle(`List of ${this.indicatorTypeName}`);
    });
  }

  getBatchDates() {
    this.commentService.getBatches().subscribe(
      (res) => {
        const batches = res.data;
        for (let index = 0; index < batches.length; index++) {
          let batch = {
            date: moment(batches[index].submission_date).format("ll"),
            batch_name: +batches[index].batch_name,
            checked: false,
            is_active: null,
          };
          batch.is_active =
            moment(Date.now()).isSameOrAfter(batch.date) || index === 0
              ? true
              : false;
          // batch.checked = batch.is_active;
          batch.checked = batch.batch_name == 3 ? true : false;
          this.submission_dates.push(batch);
        }
      },
      (error) => {
        this.alertService.error(error);
      }
    );
  }

  getIndicatorCriteria(id) {
    this.criteria_loading = true;
    this.evaluationService.getCriteriaByIndicator(id).subscribe(
      (res) => {
        this.criteriaData = res.data[0];

        this.criteria_loading = false;
      },
      (error) => {
        this.criteria_loading = false;
        this.alertService.error(error);
      }
    );
  }

  ngOnInit() {

    if (this.indicatorType == "slo") {
      this.order = "status";
    }
    // setTimeout(() => {                           //<<<---using ()=> syntax
    //   this.verifyIfOrderByStatus();
    //   this.verifyIfOrderByAcceptedWC();
    //   this.verifyIfOrderByDisagree();
    //   this.verifyIfOrderByClarification();
    // }, 5000);
    this.chatRooms = {
      general: this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://deadsimplechat.com/am16H1Vlj?username=${this.currentUser.name}`
      ),
    };
    this.showhighlightColum();

  }

  showhighlightColum() {
    if (this.currentUser.cycle.cycle_stage == 2) {
      this.showHighlightedComments = true;
      this.showTpbComments = true;
    }
  }

  getEvaluationsList(params) {
    this.showSpinner();

    this.dashService
      .geListDashboardEvaluations(
        this.currentUser.id,
        `qa_${params.type}`,
        params.primary_column
      )
      .subscribe(
        (res) => {
          if (this.indicatorType == "slo") {
            this.order = "status";
          } else {
            this.order = "status";
          }
          this.evaluationList = this.orderPipe.transform(res.data, this.order);

          this.collectionSize = this.evaluationList.length;
          this.returnedArray = this.evaluationList.slice(0, 10);
          this.returnedArrayHasStage = this.returnedArray.find(
            (e) => e.stage != null
          );

          this.hasTemplate = this.currentUser.config[0][
            `${params.type}_guideline`
          ]
            ? true
            : false;

          this.evaluationList = this.orderPipe.transform(
            res.data.filter((shi: any) =>
              this.submission_dates.some(
                (sub) =>
                  sub.date === moment(shi.submission_date).format("ll") &&
                  sub.checked
              )
            ),
            this.order
          );

          this.hideSpinner();
          setTimeout(() => {
            this.currentPage = this.indicatorService.getPagesIndicatorList();
            this.indicatorTypePage = `qa_${this.indicatorType}`;
            if (!this.verifyOrder()) this.setOrder(this.order, this.reverse);
            this.indicatorService.cleanAllOrders();
            // this.setOrder(this.order, this.reverse);
          }, 200);
          // this.currentPage = this.indicatorService.getPagesIndicatorList();
        },
        (error) => {
          this.hideSpinner();
          this.returnedArray = [];
          this.alertService.error(error);
        }
      );
  }

  fixAccent(value) {
    return value ? value.replace("´", "'") : value;
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.currentPageList = {
      startItem,
      endItem,
    };


    this.evaluationList = this.orderPipe.transform(
      this.evaluationList,
      this.reverse ? "asc" : "desc",
      this.order
    );
    this.returnedArray = this.evaluationList.slice(startItem, endItem);
  }

  setOrder(value: string, reverseValue?: boolean) {
    if (value == null) {
      this.reverse = !this.reverse;
    } else if (value != null && reverseValue != null) {
      this.order = value;
      this.reverse = reverseValue;
    } else {
      if (this.order === value) {
        this.reverse = !this.reverse;
      }
      this.order = value;
    }

    this.evaluationList = this.orderPipe.transform(
      this.evaluationList,
      this.reverse ? "asc" : "desc",
      this.order
    );
    window.scroll({
      top: 150,
      left: 0,
      behavior: "smooth",
    });
    // this.returnedArray = this.evaluationList.slice(this.currentPageList.startItem, this.currentPageList.endItem);
  }

  filterByEvalStatus() {
    this.evalStatusFilter = "Removed";
  }

  filterByAdded() {
    this.evalStatusFilter = "Added";
  }

  goToView(indicatorId) {
    this.router.navigate(["./detail", indicatorId], {
      relativeTo: this.activeRoute,
    });
    // this.router.navigate(['/reload']).then(() => { this.router.navigate(['./detail', indicatorId], { relativeTo: this.activeRoute }) });
  }

  goToPDF(type: string) {
    let pdf_url;
    switch (type) {
      case "AR":
        pdf_url = this.currentUser.config[0]["anual_report_guideline"];
        break;
      default:
        pdf_url = this.currentUser.config[0][`${type}_guideline`];

        break;
    }
    window.open(pdf_url, "_blank");
  }

  exportComments(item) {
    this.showSpinner();
    let filename = `QA-${this.indicatorType
      .charAt(0)
      .toUpperCase()}${this.indicatorType.charAt(1).toUpperCase()}-${
      item.id
    }_${moment().format("YYYYMMDD_HHmm")}`;
    if (this.authenticationService.getBrowser() === "Safari")
      filename += `.xlsx`;
    const comments = this.commentService
      .getCommentsExcel({
        evaluationId: item.evaluation_id,
        id: this.currentUser.id,
        name: filename,
        indicatorName: `qa_${this.indicatorType}`,
      })
      .subscribe(
        (res) => {
          this._exportTableSE.exportExcel(res, filename);
          this.hideSpinner();
        },
        (error) => {
          this.hideSpinner();
          this.alertService.error(error);
        }
      );
  }

  // * Para darle nombre a la columna primaria
  returnListName(indicator: string, type: string) {
    let r;
    if (type === "header") {
      switch (indicator) {
        case "slo":
          r = "Contribution to SLO targets";
          this.indicatorType = "slo";
          break;

        default:
          r = `${this.indicatorTypeName}`;
          break;
      }
    } else if (type === "list") {
      switch (indicator) {
        case "slo":
          r = "SLO target";
          break;
        case "milestones":
          r = "Milestone statement";
          break;

        default:
          r = `Title`;
          break;
      }
    }

    return r;
  }

  verifyOrder() {
    let currentOrder = this.indicatorService.getCurrentOrder();

    switch (currentOrder.type) {
      case "orderByAcceptedWC":
        this.setOrder(
          "comments_accepted_with_comment_count",
          currentOrder.value
        );
        return true;

      case "orderByDisagree":
        this.setOrder("comments_disagreed_count", currentOrder.value);
        return true;

      case "orderByClarification":
        this.setOrder("comments_clarification_count", currentOrder.value);
        return true;

      case "orderByStatus":
        this.setOrder("status", currentOrder.value);
        return true;

      default:
        return false;
    }
  }

  toggleAssessorsChat() {
    this.assessorsChat.isOpen = !this.assessorsChat.isOpen;
  }

  formatBrief(brief: string) {
    if (brief) {
      return brief.split("<p>")[1]
        ? brief.split("<p>")[1].split("</p>")[0]
        : brief;
    }
    return;
  }

  savePageList() {
    this.indicatorService.setFullPageList(this.currentPage);
  }

  onDateChange(e, subDate) {
    if (subDate) {
      const foundIndex = this.submission_dates.findIndex(
        (sd) => sd.date == e.target.value
      );

      if (foundIndex !== -1) {
        this.submission_dates[foundIndex]["checked"] = e.target.checked;
        this.submission_dates = [...this.submission_dates];

        this.getEvaluationsList({ type: this.indicatorType });
      } else {
      }
    }
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
}
