import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { AuthenticationService } from '../services/authentication.service';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        // auto logout if 401 response returned from api
        authService.logout();
        location.reload();
      }

      const error = err.error.message || err.statusText;
      return throwError(error);
    })
  ) as Observable<HttpEvent<any>>;
};
