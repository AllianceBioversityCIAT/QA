import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../../services/authentication.service';
import { AlertService } from '../../services/alert.service';

import { GeneralStatus } from '../../_models/general-status.model';

import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ActionsService } from '../../services/actions.service';
import { ClarityService } from '../../services/clarity.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./login.component.scss']
})
export default class LoginComponent implements OnInit {
  actions = inject(ActionsService);
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  env = environment;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private titleService: Title,
    private alertService: AlertService,
    private clarity: ClarityService
  ) {
    this.titleService.setTitle(`Login`);
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authenticationService
      .login(this.f['username'].value, this.f['password'].value)
      .pipe(first())
      .subscribe(
        data => {
          console.log(data);
          this.handleLoginSuccess(data);
          this.clarity.updateUserInfo();
        },
        error => {
          this.handleLoginError(error);
        }
      );
  }

  private handleLoginSuccess(data: any) {
    this.actions.showToast({
      severity: 'success',
      summary: 'Success',
      detail: 'Login successful'
    });
    if (data?.config?.length && data.config[0].status === GeneralStatus.Open) {
      window.location.reload();
    } else {
      this.router.navigate(['qa-close']);
    }
  }

  private handleLoginError(HttpError: any) {
    const { errors, status } = HttpError.error;
    console.log(HttpError.error);

    if (status === 401) {
      this.actions.showGlobalAlert({
        severity: 'warning',
        summary: 'Warning',
        detail: errors
      });
    }
    this.loading = false;
  }
}
