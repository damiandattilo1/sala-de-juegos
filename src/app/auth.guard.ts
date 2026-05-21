import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Guard implementado pero aún no aplicado a ninguna ruta.
// Se utilizará en versiones futuras para proteger rutas privadas (ej: /juegos).
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = await auth.waitForAuthReady();
  return user ? true : router.createUrlTree(['/ingresar']);
};
