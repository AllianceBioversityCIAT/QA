import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@services/authentication.service';
import { IndicatorsService } from '@services/indicators.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AlertService } from '@services/alert.service';

import { User } from '@models/user.model';
import { Role } from '@models/roles.model';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crp',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule],
  templateUrl: './crp.component.html',
  styleUrls: ['./crp.component.scss']
})
export default class CrpComponent implements OnInit {
  crp_id = null;
  crp = null;
  currentUser: User;
  indicators = [];
  params;
  spinner_name = 'sp1';
  allRoles = Role;
  env = environment;

  constructor(
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private indicatorService: IndicatorsService,
    private router: Router,
    private alertService: AlertService,
    private spinner: NgxSpinnerService
  ) {
    this.route.queryParamMap.subscribe(params => {
      this.params = params;
      this.crp_id = this.params['params']['crp_id'];

      if (params.has('token')) {
        this.validateToken(this.params['params']);
      } else {
        this.authenticationService.currentUser.subscribe(x => {
          this.currentUser = x;
        });
      }
    });
  }

  ngOnInit() {
    this.indicators = JSON.parse(localStorage.getItem('indicatorsCRP')) || [];
  }

  validateToken(params: {}) {
    this.clearSavedData();
    this.showSpinner(this.spinner_name);
    this.authenticationService.tokenLogin(params).subscribe(
      res => {
        this.authenticationService.currentUser.subscribe(x => {
          this.hideSpinner(this.spinner_name);
          this.currentUser = x;
          this.getCRP(this.crp_id);
          if ((this.indicators = [])) this.getCRPIndicators();
        });
      },
      error => {
        this.hideSpinner(this.spinner_name);
        this.alertService.error(error);
      }
    );
  }

  getCRPIndicators() {
    if (!this.indicators.length && this.currentUser) {
      this.showSpinner(this.spinner_name);
      this.indicatorService.getIndicators().subscribe(
        res => {
          this.indicators = res.data.sort((a, b) => a.order - b.order);
          localStorage.setItem('indicatorsCRP', JSON.stringify(this.indicators));
          this.hideSpinner(this.spinner_name);
          this.router.navigate([`/crp/dashboard`]);
        },
        error => {
          this.hideSpinner(this.spinner_name);
          console.log('getCRPIndicators', error);
          this.alertService.error(error);
        }
      );
    }
  }

  getCRP(crp_id) {
    this.indicatorService.getCRP(crp_id).subscribe(res => {
      this.crp = res.data;
    });
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/qa-close'], { relativeTo: this.route });
  }

  clearSavedData() {
    this.authenticationService.logout();
  }

  showSpinner(name: string) {
    this.spinner.show(name);
  }

  hideSpinner(name: string) {
    this.spinner.hide(name);
  }
}
