/**
 * Interfaz basada en DetalleVentaCreateDto.cs
 * Se usa para enviar los datos al crear una nueva venta.
 */
export interface DetalleVentaCreate {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

/**
 * Interfaz basada en DetalleVentaDto.cs
 * Se usa para recibir los datos de un detalle de venta ya existente (ej. en reportes).
 */
export interface DetalleVenta {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
