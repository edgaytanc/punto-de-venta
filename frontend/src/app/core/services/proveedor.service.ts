import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Proveedor } from '../models/proveedor.model';

@Injectable({
  providedIn: 'root',
})
export class ProveedorService {

  private apiUrl = '/api/proveedores'; // URL del endpoint de Proveedores

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los proveedores.
   * GET /api/Proveedores
   */
  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  /**
   * Obtiene un proveedor por su ID.
   * GET /api/Proveedores/{id}
   */
  getProveedorById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo proveedor.
   * POST /api/Proveedores
   */
  createProveedor(proveedor: Omit<Proveedor, 'id'>): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, proveedor);
  }

  /**
   * Actualiza un proveedor existente.
   * PUT /api/Proveedores/{id}
   */
  updateProveedor(id: number, proveedor: Proveedor): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, proveedor);
  }

  /**
   * Elimina un proveedor.
   * DELETE /api/Proveedores/{id}
   */
  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
