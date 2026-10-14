import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  const request = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(request).pipe(
    catchError((error) => {
      // Expired/invalid token on a protected call: drop the session and go to login.
      const isAuthCall = req.url.includes('/auth/');
      if (error?.status === 401 && token && !isAuthCall) {
        authService.forceLogout();
      }
      return throwError(() => error);
    })
  );
};
