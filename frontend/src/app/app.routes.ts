import { Routes } from '@angular/router';

// 1. Importamos los componentes de login y register
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';

export const routes: Routes = [
  // 2. Ruta principal (Inicio)
  // Ahora redirige a 'login' por defecto
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },

  // 3. Añadimos las nuevas rutas de autenticación
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },

  // Ruta de Administración (Lazy Loaded)
  // Esta ruta se queda igual, la protección se añade en el archivo 'admin.routes.ts'
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  // Ruta de Ventas (a futuro)
  {
    path: 'ventas',
    // loadChildren: () => ...
    redirectTo: 'admin', // Placeholder
  },
];
