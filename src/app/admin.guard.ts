import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = await auth.waitForAuthReady();
  if (!user) return router.createUrlTree(['/ingresar']);
  const isAdmin = await auth.isAdmin(user.uid);
  return isAdmin ? true : router.createUrlTree(['/']);
};
