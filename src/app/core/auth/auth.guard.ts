import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Role } from '../models/user.model';
import { AuthService } from './auth.service';

/**
 * Requires a valid login (otherwise sends the user to /login and back here afterwards).
 * With `data: { roles: [...] }` it also requires one of those roles.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    auth.logout();
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  const roles = route.data?.['roles'] as Role[] | undefined;
  if (roles && !roles.includes(auth.role()!)) {
    return router.parseUrl(auth.homeUrl());
  }
  return true;
};

/** Login, register and password reset pages: a logged-in user goes straight to their portal. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? inject(Router).parseUrl(auth.homeUrl()) : true;
};
