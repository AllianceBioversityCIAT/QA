import { Component, OnInit, HostListener } from '@angular/core';
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
import { ButtonModule } from 'primeng/button';

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

  userMenuOpen = false;

  indicatorsName = [
    { name: 'Impact Contribution', viewname: 'qa_impact_contribution', level: '' },
    { name: 'Other Outcome', viewname: 'qa_other_outcome', level: 'Outcome' },
    { name: 'Other Output', viewname: 'qa_other_output', level: 'Output' },
    { name: 'Cap Sharing', viewname: 'qa_capdev', level: 'Output' },
    { name: 'Knowledge Product', viewname: 'qa_knowledge_product', level: 'Output' },
    { name: 'Innovation Development', viewname: 'qa_innovation_development', level: 'Output' },
    { name: 'Policy Change', viewname: 'qa_policy_change', level: 'Outcome' },
    { name: 'Innovation Use', viewname: 'qa_innovation_use', level: 'Outcome' },
    { name: 'Innovation Use (IPSR)', viewname: 'qa_innovation_use_ipsr', level: 'Innovation Packages' }
  ];

  groupedIndicators = {
    'Output': [],
    'Outcome': [],
    'Innovation Packages': []
  };

  constructor(
    private activeRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    public router: Router,
    private indicatorService: IndicatorsService,
    private alertService: AlertService
  ) {
    // console.log('Refresh navbar 1');

    this.router.events.pipe(filter(e => e instanceof NavigationStart)).subscribe((e: NavigationStart) => {
      // console.log('Refresh navbar 1',e);
      if (e.url != '/login') {
        this.authenticationService.currentUser.subscribe(
          x => {
            this.currentUser = x;
            if (x) {
              // this.currentRole = x.roles[0].role.description.toLowerCase();
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
    if (this.currentUserID != this.currentUser?.id) {
      this.currentUserID = this.currentUser.id;
      // this.indicators = [];
      this.getHeaderLinks();
    } else {
      // this.currentUserID = this.currentUser.id;
      this.getHeaderLinks();
    }
    
    // If indicators are already loaded from authentication service, use them
    if (this.authenticationService.userHeaders && this.authenticationService.userHeaders.length > 0) {
      this.indicators = [...this.authenticationService.userHeaders];
      this.groupIndicatorsByLevel();
    }
    // console.log('NAV INDICATORS', this.indicators);
  }

  getIndicators() {
    // console.log('NAV INDICATORS', this.indicators);
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.userMenuOpen = false;
    }
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
          this.groupIndicatorsByLevel();

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
    } else if (this.indicators && this.indicators.length) {
      this.groupIndicatorsByLevel();
    }
  }

  groupIndicatorsByLevel() {
    // Reset grouped indicators
    this.groupedIndicators = {
      'Output': [],
      'Outcome': [],
      'Innovation Packages': []
    };

    // Group indicators by level
    this.indicators.forEach(indicator => {
      const indicatorName = indicator.indicator.name;
      const indicatorMapping = this.indicatorsName.find(
        item => item.name === indicatorName || item.viewname === indicator.indicator.view_name
      );

      if (indicatorMapping && indicatorMapping.level) {
        const level = indicatorMapping.level;
        if (this.groupedIndicators[level]) {
          this.groupedIndicators[level].push(indicator);
        }
      }
    });
  }

  getIndicatorsByLevel(level: string) {
    return this.groupedIndicators[level] || [];
  }

  hasIndicatorsInLevel(level: string): boolean {
    return this.getIndicatorsByLevel(level).length > 0;
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
      case urlAdd.indexOf('auth') != -1:
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
