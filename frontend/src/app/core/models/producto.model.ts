import { Categoria } from './categoria.model';
import { Proveedor } from './proveedor.model';

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  costo: number;
  stockActual: number;
  stockMinimo: number;

  // IDs de las relaciones
  categoriaProductoId: number;
  proveedorId: number;

  // Propiedades de navegación (para datos anidados)
  categoriaProducto?: Categoria;
  proveedor?: Proveedor;
}
