import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {

  private apiUrl = '/api/Categorias'; // URL del endpoint de Categorías

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las categorías.
   * GET /api/Categorias
   */
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  /**
   * Obtiene una categoría por su ID.
   * GET /api/Categorias/{id}
   */
  getCategoriaById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva categoría.
   * POST /api/Categorias
   */
  createCategoria(categoria: Omit<Categoria, 'id'>): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  /**
   * Actualiza una categoría existente.
   * PUT /api/Categorias/{id}
   */
  updateCategoria(id: number, categoria: Categoria): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, categoria);
  }

  /**
   * Elimina una categoría.
   * DELETE /api/Categorias/{id}
   */
  deleteCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
