import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import { User } from './../_models/user.model';
import { CookiesService } from './cookie-service.service';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  inLogin = signal(false);
  currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  public userHeaders = [];
  public NOT_APPLICABLE = '<Not applicable>';
  public userIndicators;
  private usrCookie = 'currentUser';
  private crpUsrCookie = 'currentUserCRP';
  Tawk_LoadStart = new Date();

  constructor(
    private http: HttpClient,
    private cookiesService: CookiesService,
    private router: Router,
    private activedRoute: ActivatedRoute
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem(this.usrCookie)));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    if (this.router.url.indexOf('crp') == 1) {
      this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem(this.crpUsrCookie)));
      this.currentUser = this.currentUserSubject.asObservable();
    } else {
      this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem(this.usrCookie)));
      this.currentUser = this.currentUserSubject.asObservable();
    }

    return this.currentUserSubject.value;
  }

  login(username, password) {
    return this.http.post<any>(`${environment.apiBaseUrl}auth/login`, { username, password }).pipe(
      map(user => {
        return this.setUserLogged(user.data);
      })
    );
  }

  tokenLogin(params: {}) {
    return this.http.post<any>(`${environment.apiBaseUrl}auth/token/login`, params).pipe(
      map(user => {
        this.parseMultipleCRP(user.data, params['crp_id']);
        return this.setUserLogged(user.data);
      })
    );
  }

  setUserLogged(user: User) {
    if (!user) return;
    console.log('user', user);
    const cookieName = user.crp == null ? this.usrCookie : this.crpUsrCookie;

    // Clear previous user's cached data
    this.userHeaders = [];
    localStorage.removeItem('indicators');

    let currentUsr = this.parseIndicators(user);
    delete currentUsr.password;
    this.userHeaders = user.indicators || [];
    this.markCyclesEnd(currentUsr);

    localStorage.setItem(cookieName, JSON.stringify(currentUsr));

    /** add user to tawk to **/
    this.setLoggedUserTawkTo(currentUsr);
    this.currentUserSubject.next(currentUsr);
    return currentUsr;
  }

  setLoggedUserTawkTo(user) {
    if (window.hasOwnProperty('Tawk_API')) {
      if (window['Tawk_API'].isVisitorEngaged()) window['Tawk_API'].endChat();
      window['Tawk_API'].setAttributes(
        {
          name: user.username,
          email: user.email
        },
        function (error) {}
      );
    } else {
      setTimeout(function () {
        if (window.hasOwnProperty('Tawk_API')) {
          if (window['Tawk_API'].isVisitorEngaged()) window['Tawk_API'].endChat();
          window['Tawk_API'].setAttributes(
            {
              name: user.username,
              email: user.email
            },
            function (error) {}
          );
        }
      }, 10000);
    }
  }

  getActualCycles() {
    return this.http.get<any>(`${environment.apiBaseUrl}comment/actual-cycle`);
  }

  getCycles() {
    return this.http.get<any>(`${environment.apiBaseUrl}comment/cycles`);
  }

  updateLocalStorageUserCycle(): void {
    const currentUser = JSON.parse(localStorage.getItem(this.usrCookie));

    if (!currentUser) return;

    this.getActualCycles()
      .pipe(
        catchError(error => {
          console.error('Error fetching actual cycles:', error);
          return of({ data: null });
        })
      )
      .subscribe(({ data }) => {
        if (data) {
          this.updateUserWithCycle(currentUser, data);
        } else {
          this.findAndUpdateCurrentCycle(currentUser);
        }
      });
  }

  private updateUserWithCycle(user: any, cycleData: any): void {
    localStorage.setItem(
      this.usrCookie,
      JSON.stringify({
        ...user,
        cycle: { ...cycleData }
      })
    );
  }

  private findAndUpdateCurrentCycle(user: any): void {
    this.getCycles()
      .pipe(
        catchError(error => {
          console.error('Error fetching cycles:', error);
          return of({ data: [] });
        })
      )
      .subscribe(({ data }) => {
        if (!data) return;

        const currentDate = new Date();
        const currentCycle = data.find(cycle => {
          const startDate = new Date(cycle.start_date);
          const endDate = new Date(cycle.end_date);
          return currentDate >= startDate && currentDate <= endDate;
        });

        if (currentCycle) {
          this.updateUserWithCycle(user, currentCycle);
        }
      });
  }

  logout() {
    this.logOutTawtkTo();

    // Clear all cached user data
    this.userHeaders = [];
    
    // Remove all user-specific data from localStorage
    localStorage.removeItem('indicators');
    localStorage.removeItem('indicatorsCRP');
    localStorage.removeItem(this.usrCookie);
    localStorage.removeItem(this.crpUsrCookie);
    
    // Clear all localStorage (this ensures nothing is left behind)
    localStorage.clear();
    
    // Clear cookies
    this.cookiesService.delete(this.usrCookie);
    this.cookiesService.delete(this.crpUsrCookie);
    
    // Clear user subject
    this.currentUserSubject.next(null);
  }

  private logOutTawtkTo() {
    if (window.hasOwnProperty('Tawk_API')) {
      try {
        window['Tawk_API'].endChat();
      } catch (error) {}
      window['Tawk_API'].visitor = {
        name: null,
        email: null
      };
    }
  }

  getBrowser() {
    if ((navigator.userAgent.indexOf('Opera') || navigator.userAgent.indexOf('OPR')) != -1) {
      return 'Opera';
    } else if (navigator.userAgent.indexOf('Chrome') != -1) {
      return 'Chrome';
    } else if (navigator.userAgent.indexOf('Safari') != -1) {
      return 'Safari';
    } else if (navigator.userAgent.indexOf('Firefox') != -1) {
      return 'Firefox';
    } else if (navigator.userAgent.indexOf('MSIE') != -1 || !!document['documentMode'] == true) {
      return 'IE';
    } else {
      return 'unknown';
    }
  }

  parseIndicators(user) {
    if (user.hasOwnProperty('indicators') && user.indicators.length > 0) {
      user.indicators.forEach(element => {
        delete element.indicator.meta;
      });
      localStorage.setItem('indicators', JSON.stringify(user.indicators));
    }
    return user;
  }

  /**
   * For assessor indicators parsing
   * @param userIndicators
   * @returns
   */
  parseUpdateIndicators(userIndicators) {
    if (userIndicators.length > 0) {
      userIndicators.forEach(element => {
        delete element.indicator.meta;
      });
      localStorage.setItem('indicators', JSON.stringify(userIndicators));

      delete userIndicators.indicators;
    }
    return userIndicators;
  }

  parseMultipleCRP(user, crp_id?) {
    if (user.crps.length > 0) {
      user.crp = user.crps.find(crp => crp.crp_id == crp_id);
    }
  }

  markCyclesEnd(user) {
    if (!user.hasOwnProperty('cycle')) {
      user.cycle_ended = true;
    }
  }
}
