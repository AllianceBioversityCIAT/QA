import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  TemplateRef,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  Inject,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { DetailedStatus, ReplyTypes } from "../_models/general-status.model";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { NgxSpinnerService } from "ngx-spinner";
import { AuthenticationService } from "../services/authentication.service";
import { AlertService } from "../services/alert.service";
import { User } from "../_models/user.model";
import { Role } from "../_models/roles.model";
import { CommentService } from "../services/comment.service";
import { from } from "rxjs";
import { WordCounterPipe } from "../pipes/word-counter.pipe";
import { mergeMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { EvaluationsService } from "../services/evaluations.service";
import { HighDensityScatterSeries } from "igniteui-angular-charts";
import { convertToObject } from "typescript";
import { notDeepStrictEqual } from "assert";
import { not } from "@angular/compiler/src/output/output_ast";

import * as moment from "moment";
@Component({
  selector: "app-comment",
  templateUrl: "./comment.component.html",
  styleUrls: ["./comment.component.scss"],
  providers: [WordCounterPipe],
})
export class CommentComponent implements OnInit {
  dataFromItem: any = {};
  commentGroup: FormGroup;
  totalChar = 6500;
  statusHandler = DetailedStatus;
  commentsByCol: any = [];
  commentsByColSelected: any = null;
  commentByTpb: any;
  // limitCommentsByTpb: any = null
  commentsByColReplies: any = [];
  mainComment: any = null;
  currentUser: User;
  tpbUser: any = false;
  availableComment = false;
  crpComment = false;
  is_approved = false;
  replyTypes = ReplyTypes;
  currentY;
  isActiveButton = false;
  showCommentComponent = false;
  detailItemFounded = null;
  detailItemFounded2 = null;
  adminUser: any = false;

  // require_changes = false;

  spinner_replies = "spinner_Comment_Rply";
  spinner_comment = "spinner_Comment";

  modalRef: BsModalRef;
  message: string;

  quickComments;

  currentComment;
  // @ViewChild('commentsElem', { static: false }) commentsElem: ElementRef;
  @Input() original_field;
  @Input() detailedData;
  @Input() userIsLeader: boolean;
  @Input() isCRP;
  @Input() eval_stat: any;
  // @Input() require_changes: boolean
  @Output("parentFun") parentFun: EventEmitter<any> = new EventEmitter();
  @Output("validateAllFieldsAssessed")
  validateAllFieldsAssessed: EventEmitter<any> = new EventEmitter();
  @Output("updateNumCommnts") updateNumCommnts: EventEmitter<any> =
    new EventEmitter();
  @Output("is_highlight") is_highlight = new EventEmitter<any>();
  @Output("evalu_stat") evalu_stat = new EventEmitter<any>();

  // @Output("require_change") require_change = new EventEmitter<any>();
  @ViewChild("commentContainer") private commentContainer: ElementRef;
  allRoles = Role;

  constructor(
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private commentService: CommentService,
    private wordCount: WordCounterPipe,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService
  ) {
    this.authenticationService.currentUser.subscribe((x) => {
      this.currentUser = x;
      // console.log(this.currentUser.cycle_ended);

      // console.log(this.currentUser);
      // console.log("IS_CRP", this.isCRP);
    });
  }

  ngOnInit() {
    this.commentGroup = this.formBuilder.group({
      comment: ["", Validators.required],
    });
    this.dataFromItem = [];
    // console.log("IS_CRP", this.isCRP);
    this.istpbUser();

    if (
      this.isCRP &&
      this.currentUser.roles[0].description == this.allRoles.admin
    ) {
      this.currentUser.roles.shift();
      // console.log(this.currentUser);
    }
    if (!this.isCRP) {
      this.getQuickComments();
    }
    this.findAdminUser();
  }

  findAdminUser() {
    const adminUser = this.currentUser.config.find((res) => res.roleId == 1);
    this.adminUser = adminUser != undefined ? true : false;
  }

  istpbUser() {
    const found = this.currentUser.indicators.find((element) => {
      return element?.isTPB === true;
    });
    // console.log(found, '🔥 🔥');
    this.tpbUser = found;
  }

  UpdateHighlightComment(commentId: Number, isHighlighted: Boolean, comment?) {
    let params = {
      id: commentId,
      highlight_comment: !isHighlighted,
    };

    this.detailItemFounded = this.detailedData.find(
      (detailItem) => detailItem.general_comment_id == comment.id
    );
    console.log(
      "🚀 ~ file:  UpdateHighlightComment ~ this.detailItemFounded",
      this.detailItemFounded
    );
    if (!this.detailItemFounded) {
      this.detailItemFounded = this.commentsByColSelected;
      this.detailItemFounded.highlight_comment = !isHighlighted;
    } else {
      this.detailItemFounded.highlight_comment = !isHighlighted;
    }
    console.log(this.detailedData);

    (comment.highlight_comment = !isHighlighted),
      console.log(
        "🚀 ~ file: comment.component.ts:144 ~ UpdateHighlightComment ~ comment",
        comment
      );
    console.log(params, "<===id");

    this.showSpinner(this.spinner_comment);
    // console.log()
    isHighlighted = !isHighlighted;
    this.commentService.patchHighlightComment(params).subscribe(
      (res) => {
        this.alertService.success(res.message);
        this.getItemCommentData();
      },
      (error) => {
        this.getItemCommentData();
        this.showSpinner(this.spinner_comment);
      }
    );
    this.is_highlight.emit({
      is_highlight: isHighlighted,
    });
  }

  implementedChange(commentByTpb, implementedChanges: boolean) {
    let params = {
      // id: commentId,
      commentReplyId: commentByTpb,
      ppu: !implementedChanges,
    };
    console.log(params, "<-- implemented changes by PPU");
    this.commentService.patchPpuChanges(params).subscribe((res) => {
      console.log(res);
      this.getItemCommentData();
      this.showSpinner(this.spinner_comment);
    });

    this.commentService.updateDataComment(params).subscribe((res) => {
      console.log(res, "resssssss");
    });
  }

  getQuickComments() {
    this.commentService.getQuickComments().subscribe(
      (res) => {
        this.quickComments = res.data;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  updateData(data: any, params: any) {
    this.commentsByColSelected = [];

    console.log(data);
    console.log(
      "🚀 ~ file: comment.component.ts ~ line 201 ~ CommentComponent ~ updateData ~ data",
      data
    );
    Object.assign(this.dataFromItem, data, params);
    this.availableComment = false;
    this.showSpinner(this.spinner_comment);
    this.getItemCommentData(false);
  }

  // convenience getter for easy access to form fields
  get formData() {
    return this.commentGroup.controls;
  }
  // get replyformData() { return this.replyGroup.controls; }

  closeComments() {
    this.parentFun.emit();
    this.commentsByCol = [];
    this.commentsByColReplies = [];
    this.availableComment = false;
    this.is_approved = false;
  }

  toggleTag({ commentId, tagTypeId, newTagValue }) {
    if (newTagValue) {
      this.addTag(commentId, tagTypeId);
    } else {
      this.deleteTag(commentId, tagTypeId);
    }
  }

  addTag(commentId, tagTypeId) {
    this.showSpinner(this.spinner_comment);

    this.commentService
      .createTag({ userId: this.currentUser.id, tagTypeId, commentId })
      .subscribe(
        (res) => {
          this.getItemCommentData();
          console.log(res.message);
        },
        (error) => {
          console.log("addTag", error);
          this.hideSpinner(this.spinner_comment);
          this.alertService.error(error);
        }
      );
  }

  deleteTag(commentId, tagTypeId) {
    this.showSpinner(this.spinner_comment);

    this.commentService
      .getTagId({ commentId, tagTypeId, userId: this.currentUser.id })
      .pipe(mergeMap((res) => this.commentService.deleteTag(res.data[0].tagId)))
      .subscribe(
        (res) => {
          this.getItemCommentData();
          console.log(res.message);
        },
        (error) => {
          console.log("deleteTag", error);
          this.hideSpinner(this.spinner_comment);
          this.alertService.error(error);
        }
      );
  }

  UpdateRequireChanges(commentId: number, requireChanges: boolean) {
    console.log(requireChanges, "checked");
    let params = {
      id: commentId,
      // id: commentIdCreated,
      require_changes: requireChanges,
      tpb: true,
    };
    console.log("🚀 ~ line ~ params", params);
    console.log(commentId, "<===id");

    this.showSpinner(this.spinner_comment);
    this.commentService.patchRequireChanges(params).subscribe((res) => {
      console.log(res, "<-- response require changes");
      this.getItemCommentData();
    });
  }

  addComment() {
    console.log("ADDING COMMENT");
    if (this.commentGroup.invalid) {
      this.alertService.error("comment is required", false);
      return;
    }

    // this.commentsByCol.find((tpbComment) => {
    //   if (tpbComment?.tpb && tpbComment?.is_deleted === false) {
    //     this.limitCommentsByTpb = tpbComment.tpb
    //     console.log("🚀 ~this.limitCommentsByTpb", this.limitCommentsByTpb)
    //   }
    // })

    const found = this.currentUser.indicators.find((element) => {
      return element?.isTPB === true;
    });
    this.tpbUser = found;

    let element = <HTMLInputElement>document.getElementById("require_changes");
    let checked = element?.checked;

    this.showSpinner(this.spinner_comment);

    var offset = new Date().getTimezoneOffset();
    var gmt = new Date().toLocaleString() + " GMT " + -offset / 60;
    var date = new Date(gmt);

    this.commentService
      .createDataComment({
        detail: this.formData.comment.value,
        userId: this.currentUser.id,
        evaluationId: this.dataFromItem.evaluation_id,
        metaId: this.dataFromItem.field_id,
        approved: true,
        original_field: this.original_field,
        require_changes: checked,
        tpb: found?.isTPB,
        createdAt: date,
      })
      .subscribe(
        (res) => {
          console.log("COMMENT ADDED");
          this.commentByTpb = res.data.id;
          this.getItemCommentData(true);
          this.formData.comment.reset();
          this.validateAllFieldsAssessed.emit();
          if (checked && found?.isTPB) {
            this.UpdateRequireChanges(this.commentByTpb, true);
          }
        },
        (error) => {
          console.log("getEvaluationsList", error);
          this.hideSpinner(this.spinner_comment);
          this.alertService.error(error);
        }
      );
    // UpdateRequireChanges(this.commentsByCol.id, this.commentsByCol.require_changes);
  }

  updateComment(type, data: any, parentCommentId) {
    // updateComment(type, data: any, commentId: number) {
    let canUpdate = this.validComment(type, data);
    if (!canUpdate.is_valid) {
      this.alertService.error(canUpdate.message);
      return;
    }
    data[type] = !data[type];
    // console.log({ data });
    let params = {
      approved: data.approved,
      is_visible: data.is_visible,
      is_deleted: data.is_deleted,
      id: data.id,
      detail: data.detail,
      userId: data.user.id,
      require_changes: false,
    };
    this.showSpinner(this.spinner_comment);

    this.commentService.updateDataComment(params).subscribe(
      (res) => {
        this.UpdateRequireChanges(parentCommentId, false);
        this.getItemCommentData(true);
      },
      (error) => {
        console.log("updateComment", error);
        this.hideSpinner(this.spinner_comment);

        this.alertService.error(error);
      }
    );
  }

  updateCommentReply(type, data) {
    let canUpdate = this.validComment(type, data);
    if (!canUpdate.is_valid) {
      this.alertService.error(canUpdate.message);
      return;
    }
    data[type] = !data[type];
    delete data.user.replies;
    delete data.user.crps;
    delete data.user.indicators;
    this.showSpinner(this.spinner_comment);
    this.commentService.updateCommentReply(data).subscribe(
      (res) => {
        // console.log(res)
        this.evalu_stat.emit();
        this.getItemCommentData(false);
      },
      (error) => {
        console.log("updateComment", error);
        this.hideSpinner(this.spinner_comment);

        this.alertService.error(error);
      }
    );
  }

  getItemCommentData(validateFields?: boolean) {
    let params = {
      evaluationId: this.dataFromItem.evaluation_id,
      metaId: this.dataFromItem.field_id,
    };
    this.commentService.getDataComment(params).subscribe(
      (res) => {
        this.hideSpinner(this.spinner_comment);
        console.log("COMMENT DATA", res.data);
        // const replies_count = res.data.filter(data => data.approved)[0]?  +res.data.filter(data => data.approved)[0].replies.replies_count : 0;
        let replies_count = 0;
        const answered_comments = res.data.filter((data) => data.approved);
        console.log({ answered_comments });

        if (answered_comments.length > 0) {
          answered_comments.map((ac) => {
            replies_count += +ac.replies.replies_count;
          });
        }
        console.log({ replies_count });

        this.updateNumCommnts.emit({
          length: res.data.filter((field) => field.is_deleted == false).length,
          replies_count: replies_count,
          validateFields,
        });
        //  console.log(this.currentUser.roles[0].description);

        switch (this.currentUser.roles[0].description) {
          case this.allRoles.crp:
            this.commentsByCol = res.data.filter((data) => data.approved);
            console.log(this.commentsByCol + "Commentsbycol");

            this.currentComment = this.commentsByCol.find(
              (comment) => comment.approved
            );
            this.crpComment = true;
            // this.commentsByCol.forEach(comment => {
            //   console.log(comment)
            //   if (comment.replies.replies_count != '0') {
            //     comment.isCollapsed = true;
            //     this.getCommentReplies(comment)
            //   }
            // });
            break;
          default:
            this.commentsByCol = res.data;
            break;
        }
        // console.log(this.commentsByCol);

        this.commentsByCol.forEach((comment) => {
          if (comment.replies.replies_count != "0") {
            comment.isCollapsed = true;
            this.getCommentReplies(comment);
          }
        });
        // I can iterate in reverse order
        this.commentsByCol.forEach((element) => {
          let found = false;
          if (found === false) {
            if (!element.is_deleted) {
              this.commentsByColSelected = element;
              found = true;
            }
          }
        });
        // this.limitCommentsByTpb = this.commentsByCol.find((tpbComment) => {
        //   if (tpbComment?.tpb && tpbComment?.is_deleted === false) {
        //     this.limitCommentsByTpb = tpbComment.tpb
        //     console.log("🚀 ~this.limitCommentsByTpb", this.limitCommentsByTpb)
        //   }
        // })
      },
      (error) => {
        console.log("getItemCommentData", error);
        this.hideSpinner(this.spinner_comment);
        this.alertService.error(error);
      }
    );
  }

  getCommentReplies(comment) {
    if (comment.isCollapsed) {
      // this.showSpinner(this.spinner_comment);
      let params = {
        commentId: comment.id,
        evaluationId: this.dataFromItem.evaluation_id,
      };
      this.commentService.getDataCommentReply(params).subscribe(
        (res) => {
          // this.hideSpinner(this.spinner_comment);
          // console.log('getCommentReplies', res)
          comment.loaded_replies = res.data;
          // this.commentsByColReplies = res.data
        },
        (error) => {
          console.log("getItemCommentData", error);
          this.hideSpinner(this.spinner_comment);
          this.alertService.error(error);
        }
      );
    }
  }

  //ACCEPT COMMENT
  openModal(template: TemplateRef<any>, e) {
    console.log(e.clientY);
    this.currentY = e.clientY;

    // template.elementRef.nativeElement.style.top = `${this.currentY}px`;
    this.modalRef = this.modalService.show(template, {
      class: "pos-modal modal-sm",
    });
    document.querySelector("body").style.cssText = `--position-top: ${
      this.currentY - 300
    }px`;
    // const modal = this.elem.nativeElement.querySelector('.modal-content');
    // console.log(modal);
    // console.log(template.elementRef.nativeElement);

    // template.elementRef.nativeElement.style.top.px = this.currentY;
    // this.confirmModal.nativeElement.style.top = `${this.currentY}px`;
  }

  answerComment(is_approved: any, replyTypeId: number, comment: any) {
    comment.crp_response = is_approved;
    comment.replyTypeId = replyTypeId;
    this.evalu_stat.emit();
    // this.eval_stat.emit();
    // this.is_approved = is_approved;
    // this.availableComment = true
  }
  confirm(is_approved: any, replyTypeId: number, comment: any): void {
    let newReplyTypeId = this.formData.comment.value
      ? this.replyTypes.accepted_with_comment
      : this.replyTypes.accepted;
    this.answerComment(true, newReplyTypeId, comment);
    this.replyComment(comment);
    this.modalRef.hide();
  }

  cancel(): void {
    this.modalRef.hide();
  }

  replyComment(currentComment) {
    // console.log(currentComment.replyTypeId);

    if (
      (this.commentGroup.invalid || this.formData.comment.value === "") &&
      currentComment.replyTypeId != this.replyTypes.accepted &&
      currentComment.replyTypeId != this.replyTypes.accepted_with_comment
    ) {
      this.alertService.error("Comment is required", false);
      return;
    }
    // console.log("CRP_RESPONSE", currentComment.crp_response);
    this.showSpinner(this.spinner_comment);
    this.commentService
      .createDataCommentReply({
        detail: this.formData.comment.value || "",
        userId: this.currentUser.id,
        commentId: currentComment ? currentComment.id : this.currentComment.id,
        crp_approved: this.crpComment ? currentComment.crp_response : undefined,
        replyTypeId: currentComment ? currentComment.replyTypeId : undefined,
      })
      .subscribe(
        (res) => {
          this.availableComment = false;
          this.getItemCommentData();
          this.formData.comment.reset();
          this.evalu_stat.emit();
        },
        (error) => {
          // console.log("replyComment", error);
          this.hideSpinner(this.spinner_comment);
          this.alertService.error(error);
        }
      );
  }

  validateStartedMssgs() {
    return true;
    // let isAdmin = this.currentUser.roles.map(role => { return role ? role['description'] : null }).find(role => { return role === Role.admin })
    // return isAdmin;
  }

  getWordCount(value: string) {
    return this.wordCount.transform(value);
  }

  /***
   *
   *  Spinner
   *
   ***/
  showSpinner(name: string) {
    // this.spinner.show();
    this.spinner.show(name);
  }

  hideSpinner(name: string) {
    // this.spinner.hide();
    this.spinner.hide(name);
  }

  validComment(type, data) {
    let response;
    switch (type) {
      case "approved":
        let hasApprovedComments = this.commentsByCol
          .map((comment) => comment.approved)
          .find((approved) => true);
        response = {
          is_valid: hasApprovedComments ? (data.approved ? true : false) : true,
          message: hasApprovedComments
            ? "Only one comment can be set as APPROVED"
            : null,
        };
        break;

      default:
        response = {
          is_valid: true,
          message: null,
        };
        break;
    }

    return response;
  }

  isCommentAvailable(): boolean {
    let batchValidation: boolean;
    if (this.currentUser.cycle.id === 2) {
      const commentCore = this.dataFromItem.is_core;
      if (commentCore) batchValidation = true;
      else batchValidation = false;
    } else {
      batchValidation = true;
    }

    const isCommentUnavailable =
      !this.availableComment &&
      !this.crpComment &&
      this.commentsByColSelected?.tpb !== 1 &&
      this.currentUser.hasOwnProperty("cycle") &&
      !this.isCRP &&
      batchValidation;

    return isCommentUnavailable;
  }

  setCommentValue(event, value: string) {
    event.preventDefault();
    this.commentGroup.controls.comment.setValue(value);
  }
}
