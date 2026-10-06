import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ToastService } from '../notifications/toast.service';
import { AuthService } from './auth.service';

/** Sends the JWT with every API call, and sends the user back to login when it is rejected. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const token = auth.token;
  if (token && req.url.startsWith(environment.apiUrl)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLogin = req.url.endsWith('/auth/login');
      if (error.status === 401 && !isLogin) {
        // Handled here: complete quietly so pages don't also show their own "failed to load" errors.
        if (!router.url.startsWith('/login')) {
          const message = error.error?.message === 'This account has been deactivated'
            ? 'Your account has been deactivated.'
            : 'Your session has expired. Please sign in again.';
          auth.logout();
          toast.warning(message);
          router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        }
        return EMPTY;
      }
      return throwError(() => error);
    }),
  );
};
