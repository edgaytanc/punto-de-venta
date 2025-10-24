import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

/**
 * Guardia funcional para proteger rutas.
 *
 * Verifica si el usuario está logueado (tiene un token) usando el AuthService.
 * Si el usuario está logueado, permite el acceso (return true).
 * Si no está logueado, redirige a la página '/login' y bloquea el acceso (return UrlTree).
 */
export const authGuard: CanActivateFn = (
  route,
  state
):
  | boolean
  | UrlTree
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree> => {

  // Inyectar los servicios necesarios dentro del guardián
  const authService = inject(AuthService);
  const router = inject(Router);

  // Comprobar si el usuario está logueado
  if (authService.isLoggedIn()) {
    return true; // El usuario está logueado, permitir acceso
  }

  // Si no está logueado, redirigir a la página de login
  // Usamos createUrlTree para una redirección segura desde un guard
  console.warn('Acceso denegado: Usuario no autenticado. Redirigiendo a /login...');

  // Creamos un UrlTree para que el router navegue a '/login'
  const loginUrlTree = router.createUrlTree(['/login']);

  return loginUrlTree;
};
