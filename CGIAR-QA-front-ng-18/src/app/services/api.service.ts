import { Injectable, WritableSignal, inject } from '@angular/core';
import { LoginRes, MainResponse } from '../interfaces/responses.interface';
import { GetViewComponents } from '../interfaces/api.interface';
import { ToPromiseService } from './to-promise.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  TP = inject(ToPromiseService);

  cleanBody(body: any) {
    for (const key in body) {
      if (typeof body[key] === 'string') {
        body[key] = '';
      } else if (typeof body[key] === 'number') {
        body[key] = null;
      } else if (Array.isArray(body[key])) {
        body[key] = [];
      } else {
        body[key] = null;
      }
    }
  }

  updateSignalBody(body: WritableSignal<any>, newBody: any) {
    for (const key in newBody) {
      if (newBody[key] !== null) {
        body.update(prev => ({ ...prev, [key]: newBody[key] }));
      }
    }
  }

  login = (): Promise<MainResponse<LoginRes>> => {
    const url = () => `auth/login`;
    return this.TP.post(url(), { password: 'admin-prod', username: 'qa-admin' });
  };
}
