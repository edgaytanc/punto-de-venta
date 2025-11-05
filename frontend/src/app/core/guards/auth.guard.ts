import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
// Importamos el servicio completo
import { AuthService } from '../services/auth.service';

/**
 * Guardia de autenticación SINCRÓNICO (corregido).
 * Este guardián utiliza el método 'isLoggedIn()' del AuthService,
 * que comprueba el token en localStorage.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usamos el método síncrono del servicio que SÍ proporcionaste
  if (authService.isLoggedIn()) {
    // Si el token es válido, permite la navegación
    return true;
  } else {
    // Si no hay token válido, redirige al login
    router.navigate(['/auth/login']);
    return false;
  }
};
