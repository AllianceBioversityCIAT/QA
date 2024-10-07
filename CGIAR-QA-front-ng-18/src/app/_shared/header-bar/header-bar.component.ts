import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';
import { IndicatorsService } from '../../services/indicators.service';
import { AlertService } from '../../services/alert.service';

import { User } from '../../_models/user.model';
import { Role } from '../../_models/roles.model';
import { GeneralStatus } from '../../_models/general-status.model';
import { filter, pairwise } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { TawkToComponent } from '../../tawk-to/tawk-to.component';

// import { filter, pairwise } from 'rxjs'

@Component({
  selector: 'header-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TawkToComponent],
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.scss']
})
export class HeaderBarComponent implements OnInit {
  currentUser: User;
  allRoles = Role;
  generalStatus = GeneralStatus;
  indicators = [];
  currentRole = '';
  params;
  currentUserID = null;
  isHome;

  chatRooms = null;

  assessorsChat = {
    isOpen: false
  };

  indicatorsName = [
    { name: 'Impact Contribution', viewname: 'qa_impact_contribution' },
    { name: 'Other Outcome', viewname: 'qa_other_outcome' },
    { name: 'Other Output', viewname: 'qa_other_output' },
    { name: 'Cap Sharing', viewname: 'qa_capdev' },
    { name: 'Knowledge Product', viewname: 'qa_knowledge_product' },
    { name: 'Innovation Development', viewname: 'qa_innovation_development' },
    { name: 'Policy Change', viewname: 'qa_policy_change' },
    { name: 'Innovation Use', viewname: 'qa_innovation_use' },
    { name: 'Innovation Use (IPSR)', viewname: 'qa_innovation_use_ipsr' }
  ];

  constructor(private activeRoute: ActivatedRoute, private authenticationService: AuthenticationService, public router: Router, private indicatorService: IndicatorsService, private alertService: AlertService) {
    // console.log('Refresh navbar 1');

    this.router.events.pipe(filter(e => e instanceof NavigationStart)).subscribe((e: NavigationStart) => {
      // console.log('Refresh navbar 1',e);
      if (e.url != '/login') {
        this.authenticationService.currentUser.subscribe(
          x => {
            this.currentUser = x;
            if (x) {
              this.currentRole = x.roles[0].description.toLowerCase();

              if (!this.indicators.length) this.ngOnInit();

              this.isHome = `/dashboard/${this.currentUser}`;
            }
          },
          err => {
            console.log(err);
          }
        );
      } else {
        this.indicators = [];
      }
    });
  }

  getCurrentRoute() {
    return this.router.isActive(`/dashboard/${this.currentRole}`, true);
  }

  getCurrentRouteIndicator(indicatorName: string, primaryField: string) {
    return this.router.isActive(`/indicator/${indicatorName}/${primaryField}`, true);
  }

  ngOnInit() {
    // this.indicators = [];
    if (this.currentUserID != this.currentUser.id) {
      this.currentUserID = this.currentUser.id;
      // this.indicators = [];
      this.getHeaderLinks();
    } else {
      // this.currentUserID = this.currentUser.id;
      this.getHeaderLinks();
    }
    // this.indicators = this.authenticationService.userHeaders;
    // console.log('NAV INDICATORS', this.indicators);
  }

  getIndicators() {
    // console.log('NAV INDICATORS', this.indicators);
  }

  goToView(indicator: any) {
    if (indicator === 'logo' || indicator === 'home') {
      this.router.navigate([`dashboard/${this.currentUser.roles[0].description.toLowerCase()}`]);
      return;
    }

    let view = indicator.indicator.name;
    let primary_column = indicator.indicator.primary_field;
  }

  goToAssessorsChat() {
    window.open('./assessors-chat');
  }

  getHeaderLinks() {
    // console.log('GET HEADER LINKS OUT');

    if (this.indicators && !this.indicators.length && this.currentUser && !this.isCRP()) {
      this.indicatorService.getIndicatorsByUser(this.currentUser.id).subscribe(
        res => {
          // console.log("getHeaderLinks", res);
          this.indicators = res.data.filter(indicator => (indicator.indicator.type = indicator.indicator.name.toLocaleLowerCase()));
          this.authenticationService.userHeaders = [...this.indicators];

          if (this.currentRole == 'admin') {
            //Remove last indicator (AICCRA)
            // this.indicators.pop();
          }
          // console.log(this.indicators);
        },
        error => {
          // console.log("getHeaderLinks", error);
          this.alertService.error(error);
        }
      );
    }
  }

  isCRP() {
    if (this.currentUser) {
      return this.currentUser.crp ? true : false;
    }
    return false;
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * validate current route.url to show header bar
   */
  headerAvailable() {
    const urlAdd = this.router.url;
    let r = true;
    switch (true) {
      case urlAdd == '/':
        r = false;
        break;
      case urlAdd.indexOf('login') != -1:
        r = false;
        break;
      case urlAdd.indexOf('crp') != -1:
        r = false;
        break;
      case urlAdd.indexOf('qa-close') != -1:
        r = false;
        break;

      default:
        break;
    }

    return r;
  }
}
