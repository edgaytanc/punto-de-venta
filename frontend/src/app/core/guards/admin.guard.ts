import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Guardián para proteger rutas que solo deben ser accesibles
 * por usuarios con el rol 'Admin'.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usamos el observable currentUser$ del AuthService
  return authService.currentUser$.pipe(
    take(1), // Tomamos el primer valor emitido (el estado actual) y nos desuscribimos
    map((user) => {
      // 1. Verificamos si el usuario existe
      // 2. Verificamos si la propiedad 'roles' existe en el usuario
      // 3. Verificamos si el array 'roles' incluye 'Admin'
      const isAdmin = !!user && !!user.roles && user.roles.includes('Admin');

      if (isAdmin) {
        return true; // Si es 'Admin', permite el acceso
      } else {
        // Si no es 'Admin', redirige al POS (una ruta segura)
        console.warn('AdminGuard: Acceso denegado. Se requiere rol "Admin".');
        router.navigate(['/app/pos']);
        return false; // No permite el acceso
      }
    })
  );
};
