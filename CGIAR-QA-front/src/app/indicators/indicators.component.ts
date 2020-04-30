import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgxSpinnerService } from 'ngx-spinner';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { OrderPipe } from 'ngx-order-pipe';

import { DashboardService } from "../services/dashboard.service";
import { AuthenticationService } from "../services/authentication.service";
import { CommentService } from "../services/comment.service";
import { AlertService } from '../services/alert.service';

import { User } from '../_models/user.model';
import { GeneralIndicatorName } from '../_models/general-status.model';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss']
})
export class IndicatorsComponent implements OnInit {
  indicatorType: string;
  indicatorTypeName: string;
  evaluationList: any[];
  returnedArray: any[];
  currentUser: User;

  currentPage = {
    startItem: 0,
    endItem: 10
  }
  stageHeaderText = {
    policies: 'Level',
    oicr: 'Maturity Level',
    innovations: 'Stage',
    melia: 'Type',
  }

  maxSize = 5;
  pageSize = 4;
  collectionSize = 0;
  searchText;

  notProviedText = '<No provided>'

  order: string = 'id';
  configTemplate: string;
  reverse: boolean = false;

  constructor(private activeRoute: ActivatedRoute,
    private router: Router,
    private dashService: DashboardService,
    private authenticationService: AuthenticationService,
    private commentService: CommentService,
    private spinner: NgxSpinnerService,
    private orderPipe: OrderPipe,
    private alertService: AlertService) {
    this.activeRoute.params.subscribe(routeParams => {
      this.authenticationService.currentUser.subscribe(x => {
        this.currentUser = x;
      });
      this.indicatorType = routeParams.type;
      this.configTemplate = this.currentUser.config[`${this.indicatorType}_guideline`]
      this.indicatorTypeName = GeneralIndicatorName[`qa_${this.indicatorType}`];
      this.getEvaluationsList(routeParams);
    });

  }

  ngOnInit() {
    // console.log('loaded indicators')
  }

  getEvaluationsList(params) {
    this.showSpinner();
    this.dashService.geListDashboardEvaluations(this.currentUser.id, `qa_${params.type}`, params.primary_column).subscribe(
      res => {
        this.evaluationList = this.orderPipe.transform(res.data, 'id');
        this.collectionSize = this.evaluationList.length;
        this.returnedArray = this.evaluationList.slice(0, 10);
        // this.returnedArray = this.evaluationList;
        // // console.log(this.evaluationList.length, this.returnedArray.length)
        // // console.log(this.returnedArray)
        this.hideSpinner();
      },
      error => {
        // console.log("getEvaluationsList", error);
        this.hideSpinner();
        this.returnedArray = []
        this.alertService.error(error);
      }
    )
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    // // console.log(this.evaluationList.length, this.returnedArray.length)
    this.currentPage = {
      startItem,
      endItem
    }
    this.evaluationList = this.orderPipe.transform(this.evaluationList, this.order,this.reverse);
    this.returnedArray = this.evaluationList.slice(startItem, endItem);
  }


  setOrder(value: string) {
    if (value == null) {
      this.reverse = !this.reverse;
    } else {
      if (this.order === value) {
        this.reverse = !this.reverse;
      }
      this.order = value;
    }
    console.log(this.evaluationList, this.order, this.reverse)
    this.evaluationList = this.orderPipe.transform(this.evaluationList, this.order, this.reverse);
    // this.returnedArray = this.evaluationList.slice(this.currentPage.startItem, this.currentPage.endItem);
  }


  goToView(indicatorId) {

    this.router.navigate(['./detail', indicatorId], { relativeTo: this.activeRoute });
    // this.router.navigate(['/reload']).then(() => { this.router.navigate(['./detail', indicatorId], { relativeTo: this.activeRoute }) });
  }

  goToPDF(type: string) {
    let pdf_url;
    switch (type) {
      case 'AR':
        pdf_url = this.currentUser.config[0]["anual_report_guideline"];
        break;
      default:
        pdf_url = this.currentUser.config[0][`${type}_guideline`];
        break;
    }
    window.open(pdf_url, "_blank");
  }


  exportComments(item) {
    // console.log(item)
    this.showSpinner();
    this.commentService.getCommentsExcel({ evaluationId: item.evaluation_id, id: this.currentUser.id, name: item.title }).subscribe(
      res => {
        // // console.log(res)
        let blob = new Blob([res], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8" });
        let url = window.URL.createObjectURL(blob);
        let pwa = window.open(url);
        if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
          this.alertService.error('Please disable your Pop-up blocker and try again.');
        }
        this.hideSpinner();
      },
      error => {
        // console.log("exportComments", error);
        this.hideSpinner();
        this.alertService.error(error);
      }
    )
  }


  /***
   * 
   *  Spinner 
   * 
   ***/
  showSpinner() {
    this.spinner.show(undefined,
      {
        fullScreen: true,
        type: "ball-clip-rotate-multiple"
      }
    );
  }
  hideSpinner() {
    this.spinner.hide();
  }


}
