import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

import { GeneralStatus, GeneralIndicatorName } from '../_models/general-status.model';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private _refresh$ = new Subject<void>();
  constructor(private http: HttpClient) {}

  get refresh$() {
    return this._refresh$;
  }

  // get comment stats by crp
  getCommentCRPStats(params) {
    return this.http.get<any>(`${environment.apiBaseUrl}comment/?crp_id=${params.crp_id}&id=${params.id}`);
  }

  // // get comment data for evaluation
  getDataComment(params) {
    return this.http.get<any>(`${environment.apiBaseUrl}evaluation/${params.evaluationId}/detail/comment/${params.metaId}`);
  }

  // create comment data for evaluation
  createDataComment(params) {
    return this.http.post<any>(`${environment.apiBaseUrl}evaluation/detail/comment`, params);
  }

  // update comment data for evaluation
  updateDataComment(params) {
    return this.http.patch<any>(`${environment.apiBaseUrl}evaluation/detail/comment`, params).pipe(
      tap(() => {
        this._refresh$.next();
      })
    );
  }

  // create comment data for evaluation
  createDataCommentReply(params) {
    return this.http.post<any>(`${environment.apiBaseUrl}evaluation/detail/comment/reply`, params);
  }

  // update  reply for comment
  updateCommentReply(params) {
    return this.http.patch<any>(`${environment.apiBaseUrl}evaluation/detail/comment/reply`, params);
  }

  // get comment data for evaluation
  getDataCommentReply(params) {
    return this.http.get<any>(`${environment.apiBaseUrl}evaluation/${params.evaluationId}/detail/comment/${params.commentId}/replies`);
  }

  // get comments excel
  getCommentsExcel(params) {
    // return this.http.get(`${environment.apiBaseUrl}comment/excel/${params.evaluationId}?userId=${params.id}&name=${params.name}`, { responseType: HttpRequest })
    const crpId = params.crp_id ?? '';
    return this.http.get(
      `${environment.apiBaseUrl}comment/excel/${params.evaluationId}?userId=${params.id}&name=${params.name}&crp_id=${crpId}&indicatorName=${params.indicatorName}`
    );
  }

  getCommentsExcelByInitiative(crp_id) {
    // return this.http.get(`${environment.apiBaseUrl}comment/excel/${params.evaluationId}?userId=${params.id}&name=${params.name}`, { responseType: HttpRequest })
    return this.http.get(`${environment.apiBaseUrl}comment/excel/initiative/${crp_id}`);
  }

  // get comments excel
  getCommentsRawExcel(crp_id?) {
    // return this.http.get(`${environment.apiBaseUrl}comment/excel/${params.evaluationId}?userId=${params.id}&name=${params.name}`, { responseType: HttpRequest })
    return this.http.get(`${environment.apiBaseUrl}comment/excel-raw/${crp_id}`);
  }

  // get comments raw data
  getRawComments(params) {
    return this.http.get<any>(`${environment.apiBaseUrl}comment/raw/${params.crp_id}`);
  }

  // get comments raw data
  getCycles() {
    return this.http.get<any>(`${environment.apiBaseUrl}comment/cycles`);
  }

  // update comments raw data
  updateCycle(params) {
    return this.http.patch<any>(`${environment.apiBaseUrl}comment/cycles/update`, params);
  }
  // get comments excel
  toggleApprovedNoComments(params, evaluationId) {
    return this.http.post(`${environment.apiBaseUrl}comment/approved/${evaluationId}`, params);
  }

  // create comment data for evaluation
  createTag(params) {
    return this.http.post<any>(`${environment.apiBaseUrl}evaluation/detail/comment/tag`, params);
  }

  // create comment data for evaluation
  deleteTag(id) {
    return this.http.delete<any>(`${environment.apiBaseUrl}evaluation/detail/comment/tag/${id}`);
  }

  getTagId(params) {
    return this.http.get<any>(`${environment.apiBaseUrl}evaluation/detail/comment/tag/${params.commentId}/${params.tagTypeId}/${params.userId}`);
  }

  getAllTags(crp_id?) {
    return this.http.get<any>(`${environment.apiBaseUrl}comment/tags/?crp_id=${crp_id}`);
  }

  getFeedTags(indicator_view_name, tagTypeId?) {
    return this.http.get<any>(`${environment.apiBaseUrl}comment/tags/feed/?indicator_view_name=${indicator_view_name}&tagTypeId=${tagTypeId}`);
  }

  groupTags(tags) {
    // console.log( 'TAGS ',tags);

    const tagsType = ['agree', 'disagree', 'notsure'];
    let keysIndicatorsName = Object.keys(GeneralIndicatorName);
    let tagsByIndicator = {};

    //Initialize properties
    for (const indicatorName in GeneralIndicatorName) {
      if (!tagsByIndicator.hasOwnProperty(indicatorName)) {
        tagsByIndicator[indicatorName] = {};
      }

      tagsType.forEach(tagType => {
        if (tagsByIndicator.hasOwnProperty(indicatorName)) {
          let element: any = tags.find(el => el.indicator_view_name == indicatorName && el.tagType == tagType);
          tagsByIndicator[indicatorName][tagType] = element ? +element.total : 0;
        }
      });
    }
    return tagsByIndicator;
  }

  // get batches detail
  getBatches() {
    return this.http.get<any>(`${environment.apiBaseUrl}comment/batches`);
  }

  //get list of Quick Comments
  getQuickComments() {
    return this.http.get<any>(`${environment.apiBaseUrl}comment/default-list`);
  }

  patchHighlightComment(params) {
    return this.http.patch<any>(`${environment.apiBaseUrl}evaluation/highlight-comment`, params);
  }

  patchRequireChanges(params) {
    return this.http.patch<any>(`${environment.apiBaseUrl}evaluation/require-changes`, params).pipe(
      tap(() => {
        this._refresh$.next();
      })
    );
  }

  patchPpuChanges(params) {
    return this.http.patch<any>(`${environment.apiBaseUrl}comment/ppu`, params);
  }
  getEvaluationStatus(result_id) {
    return this.http.get<any>(`${environment.apiBaseUrl}evaluation/status/${result_id}`);
  }
}
