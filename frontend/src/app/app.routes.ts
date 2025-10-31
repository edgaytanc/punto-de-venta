import { Routes } from '@angular/router';

// 1. Importamos los componentes de Auth (ya existentes)
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';

// --- 👇 NUEVAS IMPORTACIONES ---
// 2. Importamos el nuevo componente del POS
import { PuntoDeVentaComponent } from './features/pos/pages/punto-de-venta/punto-de-venta.component';
// 3. Importamos el guardián de autenticación
import { authGuard } from './core/guards/auth.guard';
// --- 👆 FIN NUEVAS IMPORTACIONES ---

export const routes: Routes = [
  // Ruta principal (Inicio)
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },

  // Rutas de Autenticación
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },

  // Ruta de Administración (Lazy Loaded)
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    // (La protección 'canActivate' ya está definida dentro de admin.routes.ts)
  },

  // --- 👇 RUTA NUEVA AÑADIDA ---
  // 4. Añadimos la ruta principal del Punto de Venta
  {
    path: 'pos',
    component: PuntoDeVentaComponent,
    canActivate: [authGuard], // <-- ¡Ruta protegida!
  },
];
