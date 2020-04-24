import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';

import { EvaluationsService } from "../../services/evaluations.service";
import { AuthenticationService } from "../../services/authentication.service";
import { AlertService } from '../../services/alert.service';
import { NgxSpinnerService } from 'ngx-spinner';


import { User } from '../../_models/user.model';
import { DetailedStatus, GeneralIndicatorName } from "../../_models/general-status.model"
import { Role } from "../../_models/roles.model"
import { CommentService } from 'src/app/services/comment.service';



@Component({
  selector: 'app-general-detailed-indicator',
  templateUrl: './general-detailed-indicator.component.html',
  styleUrls: ['./general-detailed-indicator.component.scss']
})
export class GeneralDetailedIndicatorComponent implements OnInit {
  currentUser: User;
  detailedData: any[];
  params: any;
  spinner1 = 'spinner1';
  spinner2 = 'spinner2';
  currentY = 0;
  gnralInfo = {
    status: "",
    evaluation_id: '',
    general_comment: '',
    crp_id: ''
  };
  statusHandler = DetailedStatus;
  generalCommentGroup: FormGroup;
  currentType = '';

  @ViewChild("commentsElem", { static: false }) commentsElem: ElementRef;


  activeCommentArr = [];
  fieldIndex: number;
  notApplicable = '';
  tickGroup: FormGroup;

  constructor(private activeRoute: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private commentService: CommentService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private evaluationService: EvaluationsService) {
    this.activeRoute.params.subscribe(routeParams => {
      this.authenticationService.currentUser.subscribe(x => {
        this.currentUser = x;
      });
      //console.log("general detailed")
      this.generalCommentGroup = this.formBuilder.group({
        general_comment: ['', Validators.required]
      });
      this.tickGroup = this.formBuilder.group({
        selectAll: [''],
        tick: this.formBuilder.array([], [Validators.required])
      });



      this.params = routeParams;
      this.currentType = GeneralIndicatorName[`qa_${this.params.type}`];
      // console.log(routeParams)
      this.showSpinner('spinner1')
      this.notApplicable = this.authenticationService.NOT_APPLICABLE;
      this.getDetailedData()

    })
  }

  ngOnInit() {
  }
  onSelectAllChange(e) {
    const checkboxData: FormArray = this.tickGroup.get('tick') as FormArray;
    const allTickIds = this.detailedData.map(data => data.field_id)
    if (e.target.checked) {
      console.log('if', checkboxData, allTickIds)
      allTickIds.forEach((data, index) => {
        // checkboxData.push(new FormControl(data));
        checkboxData.controls.map(value => value.get(data).setValue(true));
      })
    } else {
      console.log('else', checkboxData.controls.length)
    }
  }

  onTickChange(e, field) {
    const checkboxData: FormArray = this.tickGroup.get('tick') as FormArray;
    if (e.target.checked) {
      console.log(e.target.value)
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
  }


  getCommentsExcel(evaluation) {
    // console.log(evaluation)
    this.showSpinner('spinner1');
    let evaluationId = evaluation.evaluation_id;
    let title = this.detailedData.find(data => data.col_name === 'title');
    this.commentService.getCommentsExcel({ evaluationId, id: this.currentUser.id, name: title.display_name }).subscribe(
      res => {
        let blob = new Blob([res], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8" });
        let url = window.URL.createObjectURL(blob);
        let pwa = window.open(url);
        if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
          this.alertService.error('Please disable your Pop-up blocker and try again.');
        }
        this.hideSpinner('spinner1');
      },
      error => {
        console.log("getCommentsExcel", error);
        this.hideSpinner('spinner1');
        this.alertService.error(error);
      }
    )
  }

  goToLink(url: string) {
    window.open(url, "_blank");
  }

  goToList() {
    console.log(this.params)
  }

  getDetailedData() {
    this.evaluationService.getDataEvaluation(this.currentUser.id, this.params).subscribe(
      res => {
        this.detailedData = res.data.filter(field => {
          return field.value && field.value !== this.notApplicable;
        });
        this.generalCommentGroup.patchValue({ general_comment: this.detailedData[0].general_comment });
        this.gnralInfo = {
          evaluation_id: this.detailedData[0].evaluation_id,
          general_comment: this.detailedData[0].general_comment,
          crp_id: this.detailedData[0].evaluation_id,
          status: this.detailedData[0].status
        }
        this.activeCommentArr = Array<boolean>(this.detailedData.length).fill(false);

        this.hideSpinner('spinner1');
        //  console.log(this.detailedData)
      },
      error => {
        //console.log("getEvaluationsList", error);
        this.hideSpinner('spinner1');
        this.alertService.error(error);
      }
    )
  }

  getLink(field) {
    return (field.col_name === 'evidence_link') ? true : false;
  }
  // convenience getter for easy access to form fields
  get formData() { return this.generalCommentGroup.controls; }

  showComments(index: number, field: any) {
    // ////console.log(index, field)
    this.fieldIndex = index;
    field.clicked = !field.clicked;
    this.activeCommentArr[index] = !this.activeCommentArr[index];
    this.currentY = (index * 100);
  }

  updateNumCommnts(event, detailedData) {
    detailedData.replies_count = event.length;
  }

  updateEvaluation(type: string, data: any) {
    let evaluationData = {
      evaluation_id: data[0].evaluation_id,
      general_comments: data[0].general_comments,
      status: data[0].status,
    };

    switch (type) {
      case 'general_comment':
        if (this.generalCommentGroup.invalid) {
          this.alertService.error('A general comment is required', false)
          return;
        }
        // this.showSpinner('spinner1');
        evaluationData['general_comments'] = this.formData.general_comment.value
        break;
      case "status":
        evaluationData['status'] = (this.gnralInfo.status === this.statusHandler.Complete) ? this.statusHandler.Pending : this.statusHandler.Complete;
        break;

      default:
        break;
    }
    // //console.log(evaluationData)

    this.evaluationService.updateDataEvaluation(evaluationData, evaluationData.evaluation_id).subscribe(
      res => {
        // //console.log(res)
        this.alertService.success(res.message);
        this.showSpinner('spinner1')
        this.getDetailedData();
      },
      error => {
        //console.log("updateEvaluation", error);
        this.hideSpinner('spinner1');
        this.alertService.error(error);
      }
    )

  }

  validateCommentAvility(field, is_embed) {

    let userRole = this.currentUser.roles[0].description, avility = false;
    switch (userRole) {
      case Role.admin:
        avility = true
        break;
      case Role.asesor:
        avility = field.enable_assessor ? (this.gnralInfo.status !== this.statusHandler.Complete && field.enable_comments) : field.enable_assessor
        break;
      default:
        break;
    }
    return avility;
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

}
