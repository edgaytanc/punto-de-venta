import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { AuthResponse } from '../models/token.model';
import { Login } from '../models/login.model';
import { Register } from '../models/register.model';
import { User } from '../models/user.model';

// Interfaz para el contenido decodificado del token
interface DecodedToken {
  sub: string;
  email: string;
  unique_name: string; // ASP.NET Core usa 'unique_name' para el UserName
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private apiBaseUrl = '/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // ESTA LÓGICA ES PARA RECARGAR LA PÁGINA
    this.loadUserFromToken();
  }

  /**
   * Lógica para Iniciar Sesión (Login)
   */
  login(credentials: Login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/login`, credentials).pipe(
      tap((response) => {
        // Al hacer login, usamos los datos frescos del API
        this.saveAuthData(response.token, response.user);
      })
    );
  }

  /**
   * Lógica para Registrarse
   */
  register(userInfo: Register): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/register`, userInfo).pipe(
      tap((response) => {
        // Al registrarse, usamos los datos frescos del API
        this.saveAuthData(response.token, response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Revisa si el usuario está logueado Y si su token no ha expirado
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      const isExpired = Date.now() >= decodedToken.exp * 1000;
      return !isExpired;
    } catch (error) {
      return false; // Token inválido
    }
  }

  /**
   * Guarda el token y publica el objeto User (para Login/Register)
   */
  private saveAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    this.currentUserSubject.next(user);
  }

  /**
   * Carga al usuario desde el token (para Recargar Página)
   */
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);

        // Revisa si el token ha expirado
        const isExpired = Date.now() >= decodedToken.exp * 1000;
        if (isExpired) {
          console.warn('Token expirado, limpiando sesión.');
          this.logout();
          return;
        }

        // Si no ha expirado, crea el usuario desde el token
        const user: User = {
          id: Number(decodedToken.sub), // 'sub' es el ID del usuario
          email: decodedToken.email,
          username: decodedToken.unique_name,
        };

        // Actualiza el estado de la app
        this.currentUserSubject.next(user);

      } catch (error) {
        console.error('Token inválido, limpiando sesión:', error);
        this.logout(); // Limpia si el token es basura
      }
    }
  }
}
