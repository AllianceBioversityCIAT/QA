import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { GlobalTextDirective } from '../../directives/global-text.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [InputTextModule, ButtonModule, CardModule, ReactiveFormsModule, GlobalTextDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class LoginComponent {
  api = inject(ApiService);
  router = inject(Router);
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  onLogin = async () => {
    const res = await this.api.login(this.loginForm.value);
    if (res.successfulRequest) this.router.navigate(['/dashboard']);
    console.log(res);
  };
}
