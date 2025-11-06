/**
 * Interfaz para el usuario actualmente autenticado (viene del token JWT).
 */
export interface User {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  roles: string[];
}

// --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 6.7) ---
// Añadimos las interfaces que coinciden con los DTOs del backend
// para el módulo de administración de usuarios.

/**
 * DTO para mostrar los detalles de un usuario en la lista de admin.
 * Coincide con UsuarioDetalleDto.cs
 */
export interface UsuarioDetalle {
  id: number;
  username: string;
  email: string;
  estado: boolean;
  roles: string[];
}

/**
 * DTO para crear un nuevo usuario desde el panel de admin.
 * Coincide con UsuarioCreateDto.cs
 */
export interface UsuarioCreate {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

/**
 * DTO para actualizar un usuario existente desde el panel de admin.
 * Coincide con UsuarioUpdateDto.cs
 */
export interface UsuarioUpdate {
  email: string;
  estado: boolean;
  roles: string[];
}
// --- 👆 FIN DE LA MODIFICACIÓN ---
