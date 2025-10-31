import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta, VentaCreate } from '../models/venta.model';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private http = inject(HttpClient);

  // Usamos la ruta relativa de la API (manejada por proxy.conf.json)
  private apiBaseUrl = '/api/ventas';

  /**
   * Crea una nueva venta.
   * Corresponde al DTO 'VentaCreateDto' y retorna 'VentaDto'.
   * POST /api/ventas
   */
  crearVenta(venta: VentaCreate): Observable<Venta> {
    return this.http.post<Venta>(this.apiBaseUrl, venta);
  }

  /*
   * --- Métodos para la Épica 3 (Reportes) ---
   * Los dejamos listos para cuando los necesitemos.
   * Corresponden a los endpoints GET de VentasController.
   */

  /**
   * Obtiene todas las ventas.
   * GET /api/ventas
   */
  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiBaseUrl);
  }

  /**
   * Obtiene una venta específica por su ID.
   * GET /api/ventas/{id}
   */
  getVentaById(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiBaseUrl}/${id}`);
  }

  /**
   * Obtiene todas las ventas de un usuario específico.
   * GET /api/ventas/usuario/{usuarioId}
   */
  getVentasPorUsuario(usuarioId: number): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiBaseUrl}/usuario/${usuarioId}`);
  }

  /**
   * Obtiene ventas en un rango de fechas.
   * GET /api/ventas/fecha
   */
  getVentasPorFecha(
    fechaInicio: string,
    fechaFin: string
  ): Observable<Venta[]> {
    // Las fechas deben estar en formato ISO (ej. '2023-10-27')
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<Venta[]>(`${this.apiBaseUrl}/fecha`, { params });
  }
}
