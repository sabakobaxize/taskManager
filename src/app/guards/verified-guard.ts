import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

export const verifiedGuard: CanActivateFn = (route, state) => {
const auth = inject(Auth);
  const router = inject(Router);

  // We observe the authentication state
  return authState(auth).pipe(
    take(1), // Important: ensure the stream completes after one value
    map(user => {
      // 1. If no user is logged in, let them stay on the home page
      if (!user) {
        return true; 
      }

      // 2. If logged in but NOT verified, redirect to verification page
      if (!user.emailVerified) {
        return router.createUrlTree(['/verify-email']);
      }

      // 3. If verified, allow access
      return true;
    })
  );
};
