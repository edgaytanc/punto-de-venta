import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode'; // <-- 1. Importar la nueva librería

import { AuthResponse } from '../models/token.model';
import { Login } from '../models/login.model';
import { Register } from '../models/register.model';
import { User } from '../models/user.model';

// Interfaz para el contenido decodificado del token
interface DecodedToken {
  sub: string;
  email: string;
  unique_name: string; // ASP.NET Core usa 'unique_name' para el UserName por defecto
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
    // --- 👇 2. LLAMAR A LA NUEVA FUNCIÓN ---
    // Al iniciar el servicio, intenta cargar el usuario si hay un token
    this.loadUserFromToken();
  }

  /**
   * Envía las credenciales de login al backend.
   */
  login(credentials: Login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/login`, credentials).pipe(
      tap((response) => {
        this.saveAuthData(response.token);
      })
    );
  }

  /**
   * Envía los datos de registro al backend.
   */
  register(userInfo: Register): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/register`, userInfo).pipe(
      tap((response) => {
        this.saveAuthData(response.token);
      })
    );
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  /**
   * Obtiene el token JWT actual.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verifica si el usuario está logueado.
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    // Opcional: podrías también verificar si el token ha expirado aquí
    return true;
  }

  /**
   * Método privado para guardar el token y decodificarlo.
   */
  private saveAuthData(token: string): void {
    localStorage.setItem('token', token);
    this.loadUserFromToken(); // Decodifica y actualiza el usuario
  }

  // --- 👇 3. IMPLEMENTAR LA NUEVA FUNCIÓN ---
  /**
   * Carga y decodifica el token desde localStorage para restaurar el estado del usuario.
   */
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);

        // Creamos el objeto User a partir de los datos del token
        const user: User = {
          id: Number(decodedToken.sub), // 'sub' es el ID del usuario
          email: decodedToken.email,
          username: decodedToken.unique_name,
        };

        // Actualizamos el BehaviorSubject para que toda la app sepa quién es el usuario
        this.currentUserSubject.next(user);

      } catch (error) {
        console.error('Error al decodificar el token:', error);
        this.logout(); // Si el token es inválido, limpiamos la sesión
      }
    }
  }
}
