import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClarityService } from './clarity.service';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
import { ActionsService } from './actions.service';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  isLoadingAzureAd = signal(false);
  isLoadingCredentials = signal(false);
  requiredChangePassword = signal(false);
  body = signal<{
    username: string;
    password: string;
    confirmPassword: string;
  }>({
    username: '',
    password: '',
    confirmPassword: ''
  });
  chagePasswordSession = signal<string | null>(null);

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  api = inject(ApiService);
  clarity = inject(ClarityService);
  actions = inject(ActionsService);
  authenticationService = inject(AuthenticationService);

  async loginWithAzureAd() {
    if (this.isLoadingAzureAd()) return;

    this.isLoadingAzureAd.set(true);

    try {
      const res = await this.api.GET_loginWithAzureAd(environment.production ? 'CGIAR-Account' : 'CGIAR-AzureAD');
      window.location.href = res?.data?.authUrl;
    } catch (err) {
      console.error(err);
      this.actions.showGlobalAlert({
        severity: 'warning',
        summary: 'Warning',
        detail: 'Error while trying to login with Azure AD'
      });
    } finally {
      this.isLoadingAzureAd.set(false);
    }
  }

  async validateCognitoCode() {
    const { code } = this.activatedRoute.snapshot.queryParams ?? {};

    if (!code) {
      return;
    }

    try {
      const res = await this.api.POST_validateCognitoCode(code);
      console.log('validateCognitoCode', res);
      this.updateCacheService(res);
      this.redirectToHome();
      this.isLoadingAzureAd.set(false);
    } catch (err) {
      console.error(err);
      this.isLoadingAzureAd.set(false);
      this.actions.showGlobalAlert({
        severity: 'warning',
        summary: 'Warning',
        detail: 'Error while trying to validate Cognito code'
      });
    }
  }

  async loginWithCredentials(body: { username: string; password: string; confirmPassword: string }) {
    console.log('body', body);
    if (this.isLoadingCredentials() || body.username == '' || body.password == '') return;

    this.isLoadingCredentials.set(true);

    try {
      const res = await this.api.POST_cognitoAuth(body);
      console.log('res', res?.data?.challengeName);
      console.log(res?.data?.challengeName == 'NEW_PASSWORD_REQUIRED');
      if (res?.data?.challengeName && res?.data?.challengeName == 'NEW_PASSWORD_REQUIRED') {
        this.requiredChangePassword.set(true);
        this.isLoadingCredentials.set(false);
        this.body.set({
          username: body.username,
          password: '',
          confirmPassword: ''
        });
        this.chagePasswordSession.set(res?.data?.session);
        return;
      }
      if (res?.error?.status == 401) {
        this.actions.showGlobalAlert({
          severity: 'warning',
          summary: 'Warning',
          detail: 'Invalid credentials'
        });
        return;
      }

      this.updateCacheService(res);
      this.isLoadingCredentials.set(false);
      this.requiredChangePassword.set(false);
      this.body.set({
        username: '',
        password: '',
        confirmPassword: ''
      });
      this.redirectToHome();
    } catch (err) {
      console.error('err', err);
      this.isLoadingCredentials.set(false);
      this.requiredChangePassword.set(false);
      const statusCode = err?.error?.statusCode;
      if (statusCode == 404) {
        return this.actions.showGlobalAlert({
          severity: 'warning',
          summary: 'Warning',
          detail: 'This user is not registered. <br> Please contact the support team.'
        });
      }
      this.actions.showGlobalAlert({
        severity: 'warning',
        summary: 'Warning',
        detail: err?.error?.message
      });
    }
  }

  async changePassword() {
    const body = {
      session: this.chagePasswordSession(),
      newPassword: this.body().password,
      username: this.body().username
    };

    this.isLoadingCredentials.set(true);

    try {
      const res = await this.api.POST_cognitoChangePassword(body);
      this.updateCacheService(res);
      this.isLoadingCredentials.set(false);
      this.requiredChangePassword.set(false);
      this.body.set({
        username: '',
        password: '',
        confirmPassword: ''
      });
      this.redirectToHome();
    } catch (err) {
      console.error(err);
      this.isLoadingCredentials.set(false);
      this.requiredChangePassword.set(false);
      this.actions.showGlobalAlert({
        severity: 'warning',
        summary: 'Warning',
        detail: err?.error?.message
      });
    }
  }

  updateCacheService(resp: any) {
    this.clarity.updateUserInfo();
    this.authenticationService.setUserLogged(resp?.data);
  }

  redirectToHome() {
    this.router.navigate(['/dashboard']);
  }
}
