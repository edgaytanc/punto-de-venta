import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional para adjuntar el token JWT.
 *
 * Este interceptor se ejecuta en CADA petición HTTP.
 * 1. Obtiene el token desde el AuthService.
 * 2. Revisa si la URL es de 'login' o 'register'. Si es así, la deja pasar sin token.
 * 3. Si hay un token y NO es una ruta de auth, clona la petición y añade el encabezado 'Authorization'.
 * 4. Si no hay token, deja pasar la petición original.
 */
export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

  // Inyectamos el servicio de autenticación
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Rutas que no deben llevar el token (rutas públicas de autenticación)
  const isAuthRoute =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register');

  // Si es una ruta de auth, la dejamos pasar sin modificar
  if (isAuthRoute) {
    return next(req);
  }

  // Si tenemos un token, lo adjuntamos
  if (token) {
    // Clonamos la petición original para no mutarla
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Pasamos la petición clonada (con el header) al siguiente manejador
    return next(authReq);
  }

  // Si no es ruta de auth y no hay token, dejamos pasar la petición original
  return next(req);
};
