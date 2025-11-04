import { DetalleVenta, DetalleVentaCreate } from './detalle-venta.model';

/**
 * Interfaz basada en VentaCreateDto.cs
 * Se usa para enviar los datos al crear una nueva venta.
 */
export interface VentaCreate {
  // usuarioId: number;
  IdCliente: number; // Tu DTO C# usa 'int?' (nullable int)
  Detalles: DetalleVentaCreate[];
}

/**
 * Interfaz basada en VentaDto.cs
 * Se usa para recibir los datos de una venta ya existente (ej. en reportes).
 */
export interface Venta {
  id: number;
  fechaVenta: string; // C# DateTime se serializa como string (ISO 8601)
  totalVenta: number; // Coincide con VentaDto.TotalVenta
  idCliente: number;
  nombreCliente?: string | null; // Coincide con VentaDto.NombreCliente
  idUsuario: number;
  nombreUsuario?: string | null; // Coincide con VentaDto.NombreUsuario
  detalles?: DetalleVenta[] | null; // El DTO permite null
}
