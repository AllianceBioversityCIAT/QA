import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FooterService } from './footer.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  routes: Routes[] = [
    { path: '/dashboard/admin', marginTop: 700, mode: 'floating' },
    { path: '/indicator/', marginTop: 100, mode: '' },
    { path: '/login', mode: 'floatingAbsolute' }
  ];
  currentRoute: Routes = new Routes();
  isHover = false;
  license = environment.footerUrls.license;
  termsAndCondition = environment.footerUrls.termsAndCondition;
  constructor(private router: Router, public footerSE: FooterService) {}
  showIfRouteIsInList() {
    // console.log(this.router.url);
    this.currentRoute = new Routes();
    for (const route of this.routes) {
      if (this.router.url.includes(route?.path)) {
        this.currentRoute = route;
        return true;
      }
    }
    return false;
  }
}

class Routes {
  mode?: 'floating' | 'floatingFix' | 'floatingAbsolute' | '' = '';
  path: string;
  marginTop?: number = 0;
}
