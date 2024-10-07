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

  constructor(private authenticationService: AuthenticationService, private cookieService: CookieService, private route: ActivatedRoute, private indicatorService: IndicatorsService, private router: Router, private alertService: AlertService, private spinner: NgxSpinnerService) {
    this.route.queryParamMap.subscribe(params => {
      this.params = params;
      console.log(this.params);
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
    console.log('🚀 ~ file: crp.component.ts:53 ~ CrpComponent ~ ngOnInit ~ this.indicators', this.indicators);
    // if (this.indicators = [])
    //   this.getCRPIndicators();
  }

  validateToken(params: {}) {
    this.clearSavedData();
    this.showSpinner(this.spinner_name);
    this.authenticationService.tokenLogin(params).subscribe(
      res => {
        // console.log(res)
        this.authenticationService.currentUser.subscribe(x => {
          this.hideSpinner(this.spinner_name);
          this.currentUser = x;
          this.getCRP(this.crp_id);
          // console.log(this.currentUser)
          if ((this.indicators = [])) this.getCRPIndicators();
        });
      },
      error => {
        console.log('validateToken', error);
        this.hideSpinner(this.spinner_name);
        // this.logout()
        this.alertService.error(error);
      }
    );
  }

  getCRPIndicators() {
    if (!this.indicators.length && this.currentUser) {
      this.showSpinner(this.spinner_name);
      this.indicatorService.getIndicators().subscribe(
        res => {
          console.log('🚀 ~ file: crp.component.ts:103 ~ CrpComponent ~ getCRPIndicators ~ res', res);

          this.indicators = res.data.sort((a, b) => a.order - b.order);
          //TO-DO
          // this.indicators.pop();
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

  // getCRPIndicators() {

  //   if (this.indicators.length == 0 && this.currentUser) {
  //     this.showSpinner(this.spinner_name)
  //     this.indicatorService.getIndicatorsByUser(this.currentUser.id, this.currentUser.crp.crp_id)
  //       .subscribe(
  //         res => {
  //           this.indicators = res.data;
  //           // localStorage.setItem('indicatorsCRP', JSON.stringify(res.data));
  //           this.authenticationService.userHeaders = res.data;
  //           console.log(this.authenticationService.userHeaders)
  //           this.hideSpinner(this.spinner_name);
  //         },
  //         error => {
  //           this.hideSpinner(this.spinner_name);
  //           console.log("getCRPIndicators", error);
  //           this.alertService.error(error);
  //         }
  //       );
  //   }
  // }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/qa-close'], { relativeTo: this.route });
  }

  clearSavedData() {
    this.authenticationService.logout();
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
