import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-qa-close',
  standalone: true,
  imports: [],
  templateUrl: './qa-close.component.html',
  styleUrl: './qa-close.component.scss'
})
export default class QaCloseComponent {
  constructor(
    private authenticationService: AuthenticationService,
    public router: Router
  ) {
    this.authenticationService.logout();
  }
}
