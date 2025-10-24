export interface Register {
  username: string;
  email: string;
  password: string;
  fullName?: string; // Asumiendo que 'fullName' es opcional en el registro
}
