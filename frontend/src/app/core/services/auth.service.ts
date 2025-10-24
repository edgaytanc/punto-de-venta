import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/token.model';
import { Login } from '../models/login.model';
import { Register } from '../models/register.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  // Usamos la ruta relativa de la API que configuramos en el proxy
  private apiBaseUrl = '/api/auth';

  // BehaviorSubject para mantener el estado del usuario actual
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Opcional: Al iniciar el servicio, intenta cargar el usuario si hay un token
    // this.loadUserFromToken();
  }

  /**
   * Envía las credenciales de login al backend.
   * Si es exitoso, guarda el token y actualiza el usuario.
   */
  login(credentials: Login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/login`, credentials).pipe(
      tap((response) => {
        this.saveAuthData(response.token, response.user);
      })
    );
  }

  /**
   * Envía los datos de registro al backend.
   * Si es exitoso, guarda el token y actualiza el usuario.
   */
  register(userInfo: Register): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/register`, userInfo).pipe(
      tap((response) => {
        this.saveAuthData(response.token, response.user);
      })
    );
  }

  /**
   * Cierra la sesión del usuario, borrando el token y el estado.
   */
  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    // Aquí también podrías redirigir al login
  }

  /**
   * Obtiene el token JWT actual del localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verifica si el usuario está actualmente logueado (si existe un token).
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Método privado para guardar el token y actualizar el BehaviorSubject.
   */
  private saveAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    this.currentUserSubject.next(user);
  }

  // Opcional: Puedes descomentar esta función si quieres que el estado
  // de login persista al recargar la página (necesitarías un endpoint
  // en el backend que valide el token y devuelva los datos del usuario).

  // private loadUserFromToken(): void {
  //   const token = this.getToken();
  //   if (token) {
  //     // Aquí harías una llamada a un endpoint como /api/auth/me o /api/auth/validate
  //     // para obtener los datos del usuario basados en el token.
  //     // Por ahora, solo es un placeholder:
  //     console.log('Usuario con token, pero falta implementar validación');
  //   }
  // }
}
