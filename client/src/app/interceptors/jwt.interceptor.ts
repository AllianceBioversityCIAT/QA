import { HttpInterceptorFn } from '@angular/common/http';
import { AuthenticationService } from '../services/authentication.service';
import { inject } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService);
  let currentUser = authService.currentUserValue;
  if (currentUser && currentUser.token) {
    req = req.clone({
      setHeaders: {
        Authorization: `${currentUser.token}`
      }
    });
  }
  return next(req);
};
