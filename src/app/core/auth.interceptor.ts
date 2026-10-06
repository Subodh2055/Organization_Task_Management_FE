import {HttpErrorResponse, HttpInterceptorFn} from "@angular/common/http";
import {inject} from "@angular/core";
import {Router} from "@angular/router";
import {catchError, EMPTY, throwError} from "rxjs";
import {environment} from "../../environments/environment";
import {AuthService} from "./auth.service";
import {ToastService} from "../ToastService";
import {Alert, AlertType} from "../Alert";

/** Sends the JWT with every API call, and sends the user back to sign-in when it is rejected. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  const token = authService.token;
  if (token && req.url.startsWith(environment.ApiBaseUrl)) {
    req = req.clone({setHeaders: {Authorization: `Bearer ${token}`}});
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isSignIn = req.url.endsWith('/api/auth/signin');
      if (error.status === 401 && !isSignIn) {
        // Handled here: complete quietly so pages don't also show their own "failed to load" errors.
        if (!router.url.startsWith('/signIn')) {
          authService.logout();
          toastService.show(new Alert(AlertType.WARNING, 'Your session has expired. Please sign in again.'));
          router.navigate(['/signIn']);
        }
        return EMPTY;
      }
      return throwError(() => error);
    })
  );
};
