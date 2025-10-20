import { Categoria } from './categoria.model';
import { Proveedor } from './proveedor.model';

export interface Producto {
  id: number;
  nombreProducto: string; // <-- CAMBIO
  imagenUrl?: string;     // <-- AÑADIDO (opcional?)
  precio: number;
  stock: number;         // <-- CAMBIO

  // IDs de las relaciones (cambio de nombre)
  idCategoria: number;    // <-- CAMBIO
  idProveedor: number;    // <-- CAMBIO

  // Propiedades de navegación (mantener para datos anidados si la API los devuelve)
  categoria?: Categoria; // <-- CAMBIO (nombre de propiedad)
  proveedor?: Proveedor;
}
