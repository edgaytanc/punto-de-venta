import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

// --- (ELIMINADO) No usamos AuthResponse, usamos BackendAuthResponse ---
// import { AuthResponse } from '../models/token.model';
import { Login } from '../models/login.model';
import { Register } from '../models/register.model';
import { User } from '../models/user.model';

// --- 👇 INICIO MODIFICACIÓN Tarea 5.4 ---

// 1. Esta interfaz representa lo que SÍ envía el backend (UserDto.cs)
interface BackendAuthResponse {
  id: number;
  username: string;
  email: string;
  token: string;
}

// 2. Interfaz para el contenido decodificado del token (CON ROLES)
interface DecodedToken {
  sub: string; // ID de usuario
  email: string;
  unique_name: string; // UserName
  role: string | string[]; // <-- TAREA 5.4: Roles (puede ser uno o varios)
  exp: number; // Expiración
}
// --- 👆 FIN MODIFICACIÓN Tarea 5.4 ---

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
  // --- 👇 INICIO MODIFICACIÓN Tarea 5.4 ---
  // 3. Cambiamos AuthResponse por BackendAuthResponse
  login(credentials: Login): Observable<BackendAuthResponse> {
    return this.http.post<BackendAuthResponse>(`${this.apiBaseUrl}/login`, credentials).pipe(
      tap((response) => {
        // 4. Decodificamos el token para OBTENER los roles
        const user = this.decodeTokenAndGetUser(response.token);
        if (user) {
          this.saveAuthData(response.token, user);
        } else {
          // El token recibido del login es inválido (error de servidor)
          console.error('Token inválido recibido del servidor durante el login.');
        }
      })
    );
  }
  // --- 👆 FIN MODIFICACIÓN Tarea 5.4 ---

  /**
   * Lógica para Registrarse
   */
  // --- 👇 INICIO MODIFICACIÓN Tarea 5.4 ---
  // 5. Cambiamos AuthResponse por BackendAuthResponse
  register(userInfo: Register): Observable<BackendAuthResponse> {
    return this.http.post<BackendAuthResponse>(`${this.apiBaseUrl}/register`, userInfo).pipe(
      tap((response) => {
        // 6. Decodificamos el token para OBTENER los roles
        const user = this.decodeTokenAndGetUser(response.token);
        if (user) {
          this.saveAuthData(response.token, user);
        } else {
          // El token recibido del registro es inválido (error de servidor)
          console.error('Token inválido recibido del servidor durante el registro.');
        }
      })
    );
  }
  // --- 👆 FIN MODIFICACIÓN Tarea 5.4 ---

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
    // 7. Usamos el nuevo helper. Devuelve null si el token es inválido o expiró.
    return this.decodeTokenAndGetUser(token) !== null;
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
      // 8. Usamos el nuevo helper
      const user = this.decodeTokenAndGetUser(token);

      if (user) {
        // Token válido y no expirado, actualiza el estado
        this.currentUserSubject.next(user);
      } else {
        // Token inválido o expirado
        console.warn('Token inválido o expirado, limpiando sesión.');
        this.logout();
      }
    }
  }

  // --- 👇 INICIO MODIFICACIÓN Tarea 5.4 ---
  /**
   * 9. NUEVO HELPER: Decodifica el token, valida la expiración y extrae los roles.
   * Devuelve un objeto User completo o null si el token es inválido/expirado.
   */
  private decodeTokenAndGetUser(token: string): User | null {
    try {
      const decodedToken: DecodedToken = jwtDecode(token);

      // Revisa si el token ha expirado
      const isExpired = Date.now() >= decodedToken.exp * 1000;
      if (isExpired) {
        return null;
      }

      // Extrae los roles (manejando si es un string o un array)
      let roles: string[] = [];
      if (Array.isArray(decodedToken.role)) {
        roles = decodedToken.role;
      } else if (typeof decodedToken.role === 'string') {
        roles = [decodedToken.role];
      }

      // Crea el usuario desde el token
      const user: User = {
        id: Number(decodedToken.sub), // 'sub' es el ID del usuario
        email: decodedToken.email,
        username: decodedToken.unique_name,
        roles: roles, // <-- TAREA 5.4: Roles asignados
      };

      return user;
    } catch (error) {
      console.error('Token inválido, no se pudo decodificar:', error);
      return null; // Token inválido
    }
  }
  // --- 👆 FIN MODIFICACIÓN Tarea 5.4 ---
}
