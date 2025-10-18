export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  telefono?: string; // Opcional, basado en el modelo de C#
  direccion?: string; // Opcional
}
