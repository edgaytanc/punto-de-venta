import { DetalleVenta, DetalleVentaCreate } from './detalle-venta.model';

/**
 * Interfaz basada en VentaCreateDto.cs
 * Se usa para enviar los datos al crear una nueva venta.
 */
export interface VentaCreate {
  usuarioId: number;
  clienteId?: number | null; // Tu DTO C# usa 'int?' (nullable int)
  detalles: DetalleVentaCreate[];
}

/**
 * Interfaz basada en VentaDto.cs
 * Se usa para recibir los datos de una venta ya existente (ej. en reportes).
 */
export interface Venta {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  clienteId?: number | null; // Tu DTO C# usa 'int?'
  clienteNombre?: string | null; // Tu DTO C# usa 'string?'
  fechaVenta: string; // C# DateTime se serializa como string (ISO 8601)
  total: number;
  detalles: DetalleVenta[];
}
