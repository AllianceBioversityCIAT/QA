import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HeaderBarComponent } from './_shared/header-bar/header-bar.component';
import { AlertComponent } from './_shared/alert/alert.component';
import { GlobalAlertComponent } from './_shared/global-alert/global-alert.component';
import { GlobalToastComponent } from './_shared/global-toast/global-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, HeaderBarComponent, AlertComponent, GlobalAlertComponent, GlobalToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'CGIAR-QA-front-ng-18';
}
