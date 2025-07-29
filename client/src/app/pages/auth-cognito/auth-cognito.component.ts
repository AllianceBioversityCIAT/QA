import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CognitoService } from '../../services/cognito.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-auth-cognito',
  imports: [],
  standalone: true,
  templateUrl: './auth-cognito.component.html',
  styleUrl: './auth-cognito.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AuthCognitoComponent implements OnInit, OnDestroy {
  cognito = inject(CognitoService);
  authService = inject(AuthenticationService);

  ngOnInit(): void {
    this.authService.inLogin.set(true);
    this.cognito.validateCognitoCode();
  }

  ngOnDestroy(): void {
    this.authService.inLogin.set(false);
  }
}
