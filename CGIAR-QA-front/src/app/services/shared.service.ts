import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class SharedService {
    private _isCommentHighlight = new BehaviorSubject<boolean>(false);
    isCommentHighlight$ = this._isCommentHighlight.asObservable();

    markAsHighlight() {
        this._isCommentHighlight.next(true);
    }
    dismarkHighlight() {
        this._isCommentHighlight.next(false);
    }
}