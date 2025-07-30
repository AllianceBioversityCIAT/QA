import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { CognitoService } from '../../services/cognito.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class LoginComponent implements OnInit {
  cognito = inject(CognitoService);
  router = inject(Router);
  authenticationService = inject(AuthenticationService);
  route = inject(ActivatedRoute);
  titleService = inject(Title);
  showLoginForm = signal(false);
  returnUrl: string;

  toggleLoginForm(): void {
    this.showLoginForm.set(!this.showLoginForm());
  }

  ngOnInit(): void {
    this.titleService.setTitle(`Login`);

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
    this.authenticationService.inLogin.set(true);
  }

  validateBody(): boolean {
    if (this.cognito.requiredChangePassword()) {
      return (
        !this.cognito.body().username ||
        !this.cognito.body().password ||
        !this.cognito.body().confirmPassword ||
        !this.isPasswordValid() ||
        !this.doPasswordsMatch()
      );
    }
    return !this.cognito.body().username || !this.cognito.body().password;
  }

  // Password validation based on requirements
  isPasswordValid(): boolean {
    const password = this.cognito.body().password;

    if (this.cognito.requiredChangePassword() && !password) {
      return true;
    }

    return (
      this.hasLowerCase(password) &&
      this.hasUpperCase(password) &&
      this.hasMinLength(password) &&
      this.hasSpecialCharacter(password) &&
      this.hasNoLeadingTrailingSpaces(password)
    );
  }

  // Check if passwords match
  doPasswordsMatch(): boolean {
    return this.cognito.body().password === this.cognito.body().confirmPassword;
  }

  // Individual validation methods
  hasLowerCase(password: string): boolean {
    return /[a-z]/.test(password);
  }

  hasUpperCase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  hasMinLength(password: string): boolean {
    return password.length >= 8;
  }

  hasSpecialCharacter(password: string): boolean {
    return /[^a-zA-Z0-9]/.test(password);
  }

  hasNoLeadingTrailingSpaces(password: string): boolean {
    return password === password.trim();
  }

  // Handle keydown events to support Enter key submissions
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.validateBody()) {
      if (this.cognito.requiredChangePassword()) {
        this.cognito.changePassword();
      } else {
        this.cognito.loginWithCredentials(this.cognito.body());
      }
    }
  }

  ngOnDestroy(): void {
    this.authenticationService.inLogin.set(false);
  }
}
