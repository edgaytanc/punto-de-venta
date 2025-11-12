import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Guardián para proteger rutas que deben ser accesibles
 * por usuarios con roles 'Admin', 'POS' o 'User'.
 */
export const productGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      // Verificamos si el usuario tiene uno de los roles permitidos
      const allowedRoles = ['Admin', 'POS', 'User'];
      const hasAccess = !!user && !!user.roles && 
        user.roles.some(role => allowedRoles.includes(role));

      if (hasAccess) {
        return true;
      } else {
        console.warn('ProductGuard: Acceso denegado. Se requiere rol Admin, POS o User.');
        router.navigate(['/app/pos']);
        return false;
      }
    })
  );
};