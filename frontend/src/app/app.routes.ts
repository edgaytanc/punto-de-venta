import { Routes } from '@angular/router';

export const routes: Routes = [
  // Ruta principal (Inicio)
  // Por ahora la dejamos vacía, puedes crear un 'DashboardComponent' aquí más tarde.
  {
    path: '',
    pathMatch: 'full',
    // component: DashboardComponent
    redirectTo: 'admin' // O redirigimos a admin por ahora
  },

  // Ruta de Administración (Lazy Loaded)
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  // Ruta de Ventas (a futuro)
  {
    path: 'ventas',
    // loadChildren: () => ...
    redirectTo: 'admin' // Placeholder
  }

  // Puedes añadir más rutas aquí (login, etc.)
];
