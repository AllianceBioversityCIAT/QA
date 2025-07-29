import { Injectable, WritableSignal, inject } from '@angular/core';
import { LoginRes, LoginWithAzureAdRes, MainResponse } from '../interfaces/responses.interface';
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

  login = (body: { password: string; username: string }): Promise<MainResponse<LoginRes>> => {
    const url = () => `auth/login`;
    return this.TP.post(url(), body);
  };

  GET_loginWithAzureAd = (provider: string): Promise<MainResponse<LoginWithAzureAdRes>> => {
    const url = () => `auth/auth-url/${provider}`;
    return this.TP.get(url());
  };

  POST_validateCognitoCode = (code: string): Promise<MainResponse<any>> => {
    const url = () => `auth/validate-auth-code`;
    return this.TP.post(url(), { code });
  };

  POST_cognitoAuth = (body: { username: string; password: string; confirmPassword: string }): Promise<MainResponse<any>> => {
    const url = () => `auth/login`;
    return this.TP.post(url(), body);
  };

  POST_cognitoChangePassword = (body: { session: string; newPassword: string; username: string }): Promise<MainResponse<any>> => {
    const url = () => `auth/complete-password-challenge`;
    return this.TP.post(url(), body);
  };
}
