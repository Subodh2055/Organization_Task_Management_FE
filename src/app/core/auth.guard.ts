import {inject} from "@angular/core";
import {CanActivateFn, Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {Role} from "./auth.models";

/** Requires a valid login; with `data: {roles: [...]}` also requires one of those roles. */
export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn) {
    authService.logout();
    return router.createUrlTree(['/signIn']);
  }
  const roles = route.data?.['roles'] as Role[] | undefined;
  if (roles && !roles.includes(authService.role!)) {
    return router.parseUrl(authService.homeUrl());
  }
  return true;
};

/** Sign-in and sign-up pages: a logged-in user goes straight to their portal. */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isLoggedIn ? router.parseUrl(authService.homeUrl()) : true;
};
