import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root', // Esto hace que el servicio esté disponible en toda la app
})
export class ProductoService {

  // Esta es la URL de tu API de backend.
  // Gracias al proxy que configuramos, podemos usar una ruta relativa.
  private apiUrl = '/api/productos';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los productos del backend.
   * Corresponde a: GET /api/Productos
   */
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  /**
   * Obtiene un producto específico por su ID.
   * GET /api/productos/{id}
   */
  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene un producto específico por su ID.
   * Corresponde a: GET /api/Productos/{id}
   */
  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo producto.
   * Corresponde a: POST /api/Productos
   * (El backend espera un objeto Producto sin el ID)
   */
  createProducto(producto: Omit<Producto, 'id'>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  /**
   * Actualiza un producto existente.
   * Corresponde a: PUT /api/Productos/{id}
   */
  updateProducto(id: number, producto: Producto): Observable<void> {
    // PUT no suele devolver contenido, por eso Observable<void>
    return this.http.put<void>(`${this.apiUrl}/${id}`, producto);
  }

  /**
   * Elimina un producto.
   * Corresponde a: DELETE /api/Productos/{id}
   */
  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
