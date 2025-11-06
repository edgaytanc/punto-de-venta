import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioDetalle, UsuarioCreate, UsuarioUpdate } from '../models/user.model';

/**
 * Servicio para gestionar usuarios desde el panel de administración.
 * Consume la API /api/usuarios (protegida por rol "Admin").
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);

  // URL base para el controlador de Usuarios
  private apiUrl = '/api/usuarios';

  /**
   * GET: /api/usuarios
   * Obtiene la lista completa de todos los usuarios.
   */
  getUsuarios(): Observable<UsuarioDetalle[]> {
    return this.http.get<UsuarioDetalle[]>(this.apiUrl);
  }

  /**
   * GET: /api/usuarios/{id}
   * Obtiene los detalles de un usuario específico.
   */
  getUsuario(id: number): Observable<UsuarioDetalle> {
    return this.http.get<UsuarioDetalle>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET: /api/usuarios/roles
   * Obtiene la lista de nombres de roles disponibles (ej. ["Admin", "POS"]).
   */
  getRolesDisponibles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/roles`);
  }

  /**
   * POST: /api/usuarios
   * Crea un nuevo usuario.
   */
  createUsuario(dto: UsuarioCreate): Observable<UsuarioDetalle> {
    return this.http.post<UsuarioDetalle>(this.apiUrl, dto);
  }

  /**
   * PUT: /api/usuarios/{id}
   * Actualiza un usuario existente.
   */
  updateUsuario(id: number, dto: UsuarioUpdate): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * DELETE: /api/usuarios/{id}
   * Desactiva un usuario (borrado lógico).
   */
  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
