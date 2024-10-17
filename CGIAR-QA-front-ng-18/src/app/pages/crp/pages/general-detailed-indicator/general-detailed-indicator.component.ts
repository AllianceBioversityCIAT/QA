import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray, ValidatorFn, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EvaluationsService } from '@services/evaluations.service';
import { AuthenticationService } from '@services/authentication.service';
import { AlertService } from '@services/alert.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
// import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { User } from '@models/user.model';
import { DetailedStatus, GeneralIndicatorName, GeneralStatus, StatusNames } from '@models/general-status.model';
import { Role } from '@models/roles.model';
import { CommentService } from '@services/comment.service';

import { ExportTablesService } from '@services/export-tables.service';
import { UrlTransformPipe } from '@pipes/url-transform.pipe';
import { Title } from '@angular/platform-browser';
import { WordCounterPipe } from 'src/app/pipes/word-counter.pipe';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import moment from 'moment';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
// import { MarkdownModule } from 'ngx-markdown';
import { CommentComponent } from '../../../../comment/comment.component';

@Component({
  selector: 'app-general-detailed-indicator',
  standalone: true,
  templateUrl: './general-detailed-indicator.component.html',
  styleUrls: ['./general-detailed-indicator.component.scss'],
  providers: [UrlTransformPipe, WordCounterPipe],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgxSpinnerModule, TooltipModule, CommentComponent],
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({
          backgroundColor: '#cfeaf3',
          padding: '1em',
          marginBottom: '0.5em',
          borderRadius: '5px',
          fontStyle: 'italic',
          fontSize: '$font-xs',
          opacity: 0
        }),
        animate('0.5s ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({
          backgroundColor: '#cfeaf3',
          padding: '1em',
          marginBottom: '0.5em',
          borderRadius: '5px',
          fontStyle: 'italic',
          fontSize: '$font-xs',
          opacity: 1
        }),
        animate('0.1s ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export default class GeneralDetailedIndicatorComponent implements OnInit {
  prUrl: string;
  suscription: Subscription;
  indicatorType: string;
  currentUser: User;
  detailedData: any[] = [];
  params: any;
  spinner1 = 'spinner1';
  spinner2 = 'spinner2';
  currentY = 0;
  gnralInfo = {
    status: '',
    evaluation_id: '',
    evaluation_status: '',
    general_comment: '',
    general_comment_user: '',
    general_comment_updatedAt: '',
    general_comment_id: '',
    status_update: null,
    crp_id: '',
    requires_second_assessment: false,
    is_highlight: ''
  };
  statusHandler = DetailedStatus;
  statusNames = StatusNames;
  generalCommentGroup: FormGroup;
  currentType = '';
  isLeadAssessor: boolean;
  user: any = false;
  isCommentHighlight = false;

  approveAllitems;
  general_comment_reply;
  assessorsChat = {
    isOpen: false
  };
  chatRooms = null;
  assessed_by_r1;
  assessed_by_r2 = null;
  currentUserHasAssessed = null;
  @ViewChild('commentsElem') commentsElem: ElementRef;
  @ViewChild('containerElement') containerElement: ElementRef;
  @ViewChildren('commElement') commElements: QueryList<ElementRef>;

  totalChar = 6500;

  activeCommentArr = [];
  renderComments = false;
  actualComment;

  fieldIndex: number;
  notApplicable = '';
  tickGroup: FormGroup;
  tooltips = {
    public_link: '',
    download_excel: 'Click here to download all comments in an excel file.',
    all_approved: 'Setting this option true, will approved all items without comments.',
    changes_not_implemented: 'This field has not been updated',
    redirectTo: 'Go to general information of this result'
  };

  criteriaData;
  criteria_loading = false;
  original_field: string = '';
  hideOriginalField = true;
  constructor(private activeRoute: ActivatedRoute, private router: Router, private urlTransfrom: UrlTransformPipe, private alertService: AlertService, private commentService: CommentService, private spinner: NgxSpinnerService, private formBuilder: FormBuilder, private wordCount: WordCounterPipe, private titleService: Title, private authenticationService: AuthenticationService, private evaluationService: EvaluationsService, private sanitizer: DomSanitizer, private _exportTableSE: ExportTablesService) {
    this.activeRoute.params.subscribe(routeParams => {
      this.authenticationService.currentUser.subscribe(x => {
        this.currentUser = x;
      });
      this.indicatorType = routeParams['type'];

      this.generalCommentGroup = this.formBuilder.group({
        general_comment: ['', Validators.required]
      });
      this.tickGroup = this.formBuilder.group({
        selectAll: [''],
        tick: this.formBuilder.array([], Validators.required)
      });

      this.params = routeParams;
      this.currentType = GeneralIndicatorName[`qa_${this.params.type}`];
      this.isLeadAssessor = this.verifyIsLeadAssessor();
      this.tooltips.public_link = `Click here to see more information about this  ${this.params.type}.`;
      this.showSpinner('spinner1');
      this.notApplicable = this.authenticationService.NOT_APPLICABLE;
      this.getDetailedData();
      this.getIndicatorCriteria(`qa_${this.params.type}`);

      /** set page title */
      this.titleService.setTitle(`${this.currentType} / QA-${this.params.type.charAt(0).toUpperCase()}${this.params.type.charAt(1).toUpperCase()}-${this.params.indicatorId}`);

      this.prUrl = environment.prUrl;
    });
  }

  ngOnInit(): void {
    this.chatRooms = {
      general: this.sanitizer.bypassSecurityTrustResourceUrl(`https://deadsimplechat.com/am16H1Vlj?username=${this.currentUser.name}`)
    };

    this.suscription = this.commentService.refresh$.subscribe(() => {
      this.getDetailedData();
    });

    this.istpbUser();
  }

  istpbUser() {
    const found = this.currentUser.indicators.find(element => {
      return element?.isTPB === true;
    });
    this.user = found;
  }

  // convenience getter for easy access to form fields
  get formData() {
    return this.generalCommentGroup.controls;
  }
  get formTickData() {
    return this.tickGroup.get('tick') as FormArray;
  }

  addCheckboxes() {
    this.tickGroup = this.formBuilder.group({
      selectAll: [''],
      tick: this.formBuilder.array([], Validators.required)
    });
    this.detailedData.map(x => {
      this.formTickData.controls.push(
        this.formBuilder.group({
          data: x,
          isChecked: x.approved_no_comment ? true : false
        })
      );
      if (!x.approved_no_comment) {
        this.approveAllitems;
      }
    });
    this.checkAllIsApproved();
  }

  validateComments() {
    let response;
    for (let index = 0; index < this.detailedData.length; index++) {
      const element = this.detailedData[index];
      response = parseInt(element.replies_count) > 0 || this.formTickData.controls[index].value.isChecked;
      if (!response) return !response;
    }
    return !response;
  }

  validateUpdateEvaluation() {
    let checked_row = this.detailedData.filter((data, i) => (this.formTickData.controls[i].value.isChecked ? data : undefined)).map(d => d.field_id);
    let commented_row = this.detailedData.filter(data => data.replies_count != '0').map(d => d.field_id);
    let availableData = this.detailedData.filter(data => data.enable_comments);
    if (this.gnralInfo.status !== this.statusHandler.Pending && this.gnralInfo.status !== this.statusHandler.Finalized && this.currentUser.hasOwnProperty('cycle')) {
      // if (this.gnralInfo.status !== this.statusHandler.Complete) {
      if (checked_row.length + commented_row.length == availableData.length) {
        this.gnralInfo.status_update = this.statusHandler.Complete;
        this.updateEvaluation('status', this.detailedData);
      } else if (this.gnralInfo.status == this.statusHandler.Complete) {
        this.gnralInfo.status_update = this.statusHandler.Pending;
        this.updateEvaluation('status', this.detailedData);
      }
    }
  }

  onTickChange(e, field) {
    if (field) {
      let noComment = e.target.checked ? true : false;
      field.loading = true;

      this.commentService
        .toggleApprovedNoComments(
          {
            meta_array: [field.field_id],
            isAll: false,
            userId: this.currentUser.id,
            noComment
          },
          field.evaluation_id
        )
        .subscribe(
          res => {
            field.loading = false;
            // this.validateUpdateEvaluation();
            this.validateAllFieldsAssessed();
          },
          error => {
            this.alertService.error(error);
            field.loading = false;
          }
        );
    }
  }

  onChangeSelectAll(e) {
    let selected_meta = [];
    let noComment;
    if (e) {
      this.formTickData.controls.map((value, i) => (this.detailedData[i].replies_count == '0' ? value.get('isChecked').setValue(true) : value.get('isChecked')));
      selected_meta = this.detailedData.filter((data, i) => (this.formTickData.controls[i].value.isChecked ? data : undefined)).map(d => d.field_id);
      noComment = true;
      this.gnralInfo.status_update = this.statusHandler.Finalized;
    } else {
      this.formTickData.controls.map(value => value.get('isChecked').setValue(false));
      selected_meta = this.detailedData.filter((data, i) => (!this.formTickData.controls[i].value.isChecked ? data : undefined)).map(d => d.field_id);
      noComment = false;
      this.gnralInfo.status_update = this.statusHandler.Pending;
    }
    this.showSpinner('spinner1');
    this.commentService
      .toggleApprovedNoComments(
        {
          meta_array: selected_meta,
          userId: this.currentUser.id,
          isAll: true,
          noComment
        },
        this.gnralInfo.evaluation_id
      )
      .subscribe(
        res => {
          this.updateEvaluation('status', this.detailedData);
          // this.approveAllitems = !e;
        },
        error => {
          this.alertService.error(error);
          this.hideSpinner('spinner1');
        }
      );
  }

  checkAllIsApproved() {
    let statusByField = [];
    this.formTickData.controls.forEach((value, i) => {
      statusByField.push({
        display_name: this.detailedData[i].display_name,
        value: this.detailedData[i].replies_count != '0' || value.get('isChecked').value || this.detailedData[i].enable_comments == false ? true : false
      });
    });
    this.approveAllitems = statusByField.find(e => e.value == false) ? false : true;
    return this.approveAllitems;
  }

  validateAllFieldsAssessed() {
    let initialStatus = this.gnralInfo.status;
    let allFieldsAssessed: boolean = false;
    let statusByField = [];
    this.formTickData.controls.forEach((value, i) => {
      statusByField.push({
        display_name: this.detailedData[i].display_name,
        value: this.detailedData[i].replies_count != '0' || value.get('isChecked').value || this.detailedData[i].enable_comments == false ? true : false
      });
    });
    let fieldWithoutAssessed = statusByField.find(e => e.value == false);
    // existNotAssessed = existNotAssessed.value;

    if (fieldWithoutAssessed == undefined) {
      allFieldsAssessed = true;
      this.gnralInfo.status_update = this.statusHandler.Finalized;
      this.updateEvaluation('status', this.detailedData);
    } else {
      allFieldsAssessed = false;
      this.gnralInfo.status_update = this.statusHandler.Pending;
      if (initialStatus != this.statusHandler.Pending) {
        this.updateEvaluation('status', this.detailedData);
      }
    }
  }
  updateHighlight(e) {}

  getDetailedData() {
    this.evaluationService.getDataEvaluation(this.currentUser.id, this.params).subscribe(
      res => {
        this.detailedData = res.data.filter(field => {
          if (typeof field.value === 'number') field.value = String(field.value);
          if (field.value) {
            field.value = field.value.replace('´', "'");
            if (field.value.includes('<table>')) {
              field.value = field.value.replace(new RegExp('<p>', 'g'), '');
              field.value = field.value.replace(new RegExp('</p>', 'g'), ' ');
              field.value = field.value.replace(new RegExp('<td>', 'g'), `<td><p class="p-styles">`);
              field.value = field.value.replace(new RegExp('</td>', 'g'), '</p></td>');
              field.value = field.value.replace(new RegExp('\n', 'g'), ' ');
            } else {
              field.value = field.value.replace(new RegExp('\n', 'g'), '<br />');
            }
            field.value = field.value.replace(new RegExp('<a', 'g'), '<a target="_blank"');
            field.value = this.urlTransfrom.urlToAnchor(field.value);
          }
          return field.value !== this.notApplicable;
        });
        this.generalCommentGroup.patchValue({
          general_comment: this.detailedData[0].general_comment
        });
        this.gnralInfo = {
          evaluation_id: this.detailedData[0].evaluation_id,
          general_comment: this.detailedData[0].general_comment,
          crp_id: this.detailedData[0].evaluation_id,
          evaluation_status: this.detailedData[0].evaluation_status,
          status: this.detailedData[0].status,
          general_comment_id: this.detailedData[0].general_comment_id,
          status_update: null,
          general_comment_updatedAt: this.detailedData[0].general_comment_updatedAt,
          general_comment_user: this.detailedData[0].general_comment_user,
          requires_second_assessment: this.detailedData[0].require_second_assessment,
          is_highlight: this.detailedData[0].is_highlight
        };
        // this.approveAllitems = (this.gnralInfo.status === this.statusHandler.Complete) ? false : true;
        this.approveAllitems = false;
        this.activeCommentArr = Array<boolean>(this.detailedData.length).fill(false);
        this.evaluationService.getAssessorsByEvaluation(this.gnralInfo.evaluation_id).subscribe(
          res => {
            this.assessed_by_r1 = res.data.assessed_r1;
            this.assessed_by_r2 = res.data.assessed_r2;
            if (this.assessed_by_r1) {
              this.currentUserHasAssessed = this.assessed_by_r1.indexOf(this.currentUser.username) >= 0 ? true : false;
            }
          },
          error => {
            this.hideSpinner('spinner1');
            this.alertService.error(error);
          }
        );
        this.hideSpinner('spinner1');
        this.tickGroup.reset();
        // this.getCommentReplies(); // carga desde un componente que no deberia de esperar respuestas
        this.addCheckboxes();
      },
      error => {
        this.hideSpinner('spinner1');
        this.alertService.error(error);
      }
    );
  }

  getCommentsExcel(evaluation) {
    this.showSpinner('spinner1');
    let evaluationId = evaluation.evaluation_id;
    let title = this.detailedData.find(data => data.col_name === 'title');
    let filename = `QA-${this.params.type.charAt(0).toUpperCase()}${this.params.type.charAt(1).toUpperCase()}-${this.detailedData[0].result_code}_${moment().format('YYYYMMDD_HHmm')}`;

    this.commentService
      .getCommentsExcel({
        evaluationId,
        id: this.currentUser.id,
        name: filename,
        indicatorName: `qa_${this.params.type}`
      })
      .subscribe(
        res => {
          this._exportTableSE.exportExcel(res, filename);
          this.hideSpinner('spinner1');
        },
        error => {
          this.hideSpinner('spinner1');
          this.alertService.error(error);
        }
      );
  }

  goToLink(url: string) {
    window.open(url, '_blank');
  }

  goToList() {}

  getLink(field) {
    return field.col_name === 'evidence_link' ? true : false;
  }

  getIndicatorCriteria(id) {
    this.criteria_loading = true;
    this.evaluationService.getCriteriaByIndicator(id).subscribe(
      res => {
        this.criteriaData = res.data[0];

        this.criteria_loading = false;
      },
      error => {
        this.criteria_loading = false;
        this.alertService.error(error);
      }
    );
  }

  /**
   *
   *
   *
   */

  getWordCount(value: string) {
    return this.wordCount.transform(value);
  }

  //Emitted from comment component
  hideComments(index: number, field: any, e?) {
    this.fieldIndex = index;
    field.clicked = !field.clicked;
    this.activeCommentArr[index] = !this.activeCommentArr[index];
    if (this.actualComment) {
      this.actualComment.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
        inline: 'nearest'
      });
    }
    // this.commentsElem.nativeElement.scrollIntoView({ behavior: "smooth"});
    // if(!this.activeCommentArr[index]) this.validateAllFieldsAssessed();
  }

  showComments(index: number, field: any, elementRef: any, e?) {
    this.fieldIndex = index;
    field.clicked = !field.clicked;
    this.activeCommentArr[index] = !this.activeCommentArr[index];

    // this.commentsElem.nativeElement.scrollIntoView({ behavior: "smooth"});
    if (e) {
      setTimeout(() => {
        let parentPos = this.getPosition(this.containerElement.nativeElement);
        let yPosition = this.getPosition(elementRef);

        this.currentY = yPosition.y - parentPos.y;
        this.renderComments = this.activeCommentArr[index];
        this.actualComment = elementRef;
        elementRef.scrollIntoView({ block: 'start', behavior: 'smooth' });

        // setTimeout(()=> {window.scrollBy({top: -10, behavior: 'smooth'})},500);
      }, 100);
    }
    // if(!this.activeCommentArr[index]) this.validateAllFieldsAssessed();
  }

  getPosition(el) {
    let xPos = 0;
    let yPos = 0;
    while (el) {
      if (el.tagName == 'BODY') {
        // deal with browser quirks with body/window/document and page scroll
        let xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        let yScroll = el.scrollTop || document.documentElement.scrollTop;

        xPos += el.offsetLeft - xScroll + el.clientLeft;
        yPos += el.offsetTop - yScroll + el.clientTop;
      } else {
        // for all other non-BODY elements
        xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
        yPos += el.offsetTop - el.scrollTop + el.clientTop;
      }

      el = el.offsetParent;
    }
    return {
      x: xPos,
      y: yPos
    };
  }

  // updateHighlightt() {
  //   dataFromItem.length = lenght;
  //   if (validateFields) this.validateAllFieldsAssessed()
  // }

  updateNumCommnts({ length, validateFields }, detailedData) {
    detailedData.replies_count = length;
    if (validateFields) this.validateAllFieldsAssessed();
  }

  updateEvaluation(type: string, data: any) {
    let evaluationData = {
      evaluation_id: data[0].evaluation_id,
      status: data[0].status
    };
    this.showSpinner('spinner1');
    switch (type) {
      case 'status':
        evaluationData['status'] = this.gnralInfo.status_update;
        // evaluationData['status'] = (this.gnralInfo.status === this.statusHandler.Complete) ? this.statusHandler.Pending : this.statusHandler.Complete;
        break;
      case 'finalized':
        // evaluationData['status'] = this.gnralInfo.status_update;
        evaluationData['status'] = this.statusHandler.Finalized;
        break;
      case 'complete':
        // evaluationData['status'] = this.gnralInfo.status_update;
        evaluationData['status'] = this.statusHandler.Complete;
        break;
      case 'pending':
        // evaluationData['status'] = this.gnralInfo.status_update;
        evaluationData['status'] = this.statusHandler.Pending;
        break;

      default:
        break;
    }

    this.evaluationService.updateDataEvaluation(evaluationData, evaluationData.evaluation_id).subscribe(
      res => {
        this.alertService.success(res.message);

        this.getDetailedData();
      },
      error => {
        this.hideSpinner('spinner1');
        this.alertService.error(error);
      }
    );
  }

  markForSecondAssessment() {
    this.showSpinner('spinner1');

    this.evaluationService
      .updateRequireSecondAssessmentEvaluation(this.gnralInfo.evaluation_id, {
        require_second_assessment: !this.gnralInfo.requires_second_assessment
      })
      .subscribe(
        res => {
          this.hideSpinner('spinner1');
          this.gnralInfo.requires_second_assessment = !this.gnralInfo.requires_second_assessment;
        },
        error => {
          this.hideSpinner('spinner1');
          this.alertService.error(error);
        }
      );
  }

  validateCommentAvility(field, is_embed?) {
    let userRole = this.currentUser.roles[0].description,
      avility = false;
    switch (userRole) {
      case Role.admin:
        avility = field.enable_comments ? true : false;
        break;
      case Role.asesor:
        if (this.gnralInfo.status === this.statusHandler.Pending) {
          avility = field.enable_assessor ? field.enable_comments : field.enable_assessor;
        } else {
          avility = field.enable_assessor ? field.enable_comments : field.enable_assessor;
        }

        // else if (this.gnralInfo.status === this.statusHandler.Finalized){
        //   avility = true;
        // }
        // avility = field.enable_assessor ? (this.gnralInfo.status !== this.statusHandler.Finalized && field.enable_comments) : field.enable_assessor
        break;
      default:
        break;
    }
    return avility;
  }

  addGeneralComment(name, array) {
    let data = array[0];
    let request;
    if (data.general_comment) {
      request = this.commentService.updateDataComment({
        id: data.general_comment_id,
        detail: this.formData['general_comment'].value,
        userId: this.currentUser.id,
        evaluationId: this.gnralInfo.evaluation_id,
        metaId: null,
        approved: true
      });
    } else {
      request = this.commentService.createDataComment({
        detail: this.formData['general_comment'].value,
        userId: this.currentUser.id,
        evaluationId: this.gnralInfo.evaluation_id,
        metaId: null,
        approved: true
      });
    }

    request.subscribe(
      res => {
        this.alertService.success(res.message);
        this.showSpinner('spinner1');
        this.getDetailedData();
      },
      error => {
        this.hideSpinner('spinner1');
        this.alertService.error(error);
      }
    );
  }

  getCommentReplies() {
    // this.showSpinner('spinner1');
    // let params = { commentId: comment.id, evaluationId: this.gnralInfo.evaluation_id }
    let params = {
      commentId: this.gnralInfo.general_comment_id,
      evaluationId: this.gnralInfo.evaluation_id
    };
    this.commentService.getDataCommentReply(params).subscribe(
      res => {
        this.hideSpinner('spinner1');
        // comment.loaded_replies = res.data;
        this.general_comment_reply = res.data;
      },
      error => {
        if (error !== 'OK') this.alertService.error(error);
      }
    );
  }

  parseGeneralStatus(status) {
    let statusParse;
    switch (status) {
      case this.statusHandler.Pending:
        statusParse = 'Pending';
        break;
      case this.statusHandler.Autochecked:
        statusParse = 'Automatically Validated';
        break;
      case this.statusHandler.Complete:
        statusParse = 'Assessed 1st round';
        break;
      case this.statusHandler.Finalized:
        statusParse = 'Assessed 2nd round';
        break;
      default:
        break;
    }

    return statusParse;
  }

  verifyIsLeadAssessor() {
    return this.currentUser.indicators.find(el => el.indicator.view_name.split('qa_')[1] == this.indicatorType && el.isLeader) ? true : false;
  }

  toggleAssessorsChat() {
    this.assessorsChat.isOpen = !this.assessorsChat.isOpen;
  }

  /***
   *
   *  Spinner
   *
   ***/
  showSpinner(name: string) {
    this.spinner.show(name);
  }

  hideSpinner(name: string) {
    this.spinner.hide(name);
  }

  getCurrentTypeUrl(): string {
    const baseUrl = this.params.type === 'innovation_use_ipsr' ? 'ipsr/' : 'result/';

    const outlet = this.params.type === 'innovation_use_ipsr' ? 'detail/' : 'result-detail/';

    const url = this.prUrl + baseUrl + outlet + this.detailedData[0].result_code + '/general-information?' + `phase=${this.detailedData[0].version}`;

    return url;
  }
}
