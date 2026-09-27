import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { FirebaseAuthService } from '../firebase/firebase-auth.service';

/**
 * Functional route guard acting as a defensive gatekeeper.
 * Allows navigation if user is authenticated; otherwise redirects to `/login`.
 */
export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
