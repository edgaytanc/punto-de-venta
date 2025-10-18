export interface Proveedor {
  id: number;
  nombreProveedor: string; // <-- CAMBIO
  contacto: string;
  telefono: string;        // <-- CAMBIO (ahora requerido)
  direccion: string;       // <-- CAMBIO (ahora requerido)
  correo: string;          // <-- AÑADIDO
}
