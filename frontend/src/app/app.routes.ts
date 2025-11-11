import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { productGuard } from './core/guards/product.guard';

// --- IMPORTAMOS LOS NUEVOS LAYOUTS ---
import AuthLayoutComponent from './layouts/auth-layout/auth-layout.component';
import MainLayoutComponent from './layouts/main-layout/main-layout.component';

// --- IMPORTAMOS COMPONENTES DE AUTH (con llaves {}) ---
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';

// --- EXPORTAMOS 'routes' (para que app.config.ts lo encuentre) ---
export const routes: Routes = [
  // --- GRUPO DE RUTAS PÚBLICAS (AUTH) ---
  // Carga AuthLayoutComponent (fondo centrado, sin menús)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // --- GRUPO DE RUTAS PRIVADAS (APP) ---
  // Carga MainLayoutComponent (menú lateral y barra superior)
  {
    path: 'app', // <--- Nueva ruta padre para todo lo protegido
    component: MainLayoutComponent,
    canActivate: [authGuard], // <-- 1. Este guardián (authGuard) verifica que el usuario ESTÉ LOGUEADO
    children: [
      {
        path: 'admin',
        // --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 5.7) ---
        // 2. Este guardián (adminGuard) verifica que el usuario LOGUEADO SEA ADMIN
        canActivate: [adminGuard],
        // --- 👆 FIN DE LA MODIFICACIÓN ---
        loadChildren: () =>
          // Carga la constante 'ADMIN_ROUTES' de admin.routes
          import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'pos',
        loadComponent: () =>
          // Carga la clase 'PuntoDeVentaComponent'
          import(
            './features/pos/pages/punto-de-venta/punto-de-venta.component'
          ).then((m) => m.PuntoDeVentaComponent),
      },
      {
        path: 'productos',
        canActivate: [productGuard],
        loadComponent: () =>
          import('./features/admin/pages/producto-list/producto-list.component'),
      },
      // Redirección por defecto DENTRO de la app
      {
        path: '',
        redirectTo: 'pos',
        pathMatch: 'full',
      },
    ],
  },

  // --- REDIRECCIÓN RAÍZ ---
  // Cuando alguien visita localhost:4200 (path: '')
  // lo enviamos directo al login.
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },

  // --- RUTA COMODÍN (WILDCARD) ---
  // Cualquier otra ruta no encontrada, la mandamos al login.
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
