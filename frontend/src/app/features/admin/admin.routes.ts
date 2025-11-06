import { Routes } from '@angular/router';
import ProductoListComponent from './pages/producto-list/producto-list.component';
import CategoriaListComponent from './pages/categoria-list/categoria-list.component';
import ProveedorListComponent from './pages/proveedor-list/proveedor-list.component';
import ReporteVentasComponent from './pages/reporte-ventas/reporte-ventas.component';

// 1. Ya no necesitamos importar el guardián aquí,
// porque la ruta padre ('/app') ya nos protege.
// import { authGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'productos',
  },
  {
    path: 'productos',
    component: ProductoListComponent,
    // 2. Eliminamos el guardián de aquí
  },
  {
    path: 'categorias',
    component: CategoriaListComponent,
    // 3. Eliminamos el guardián de aquí
  },
  {
    path: 'proveedores',
    component: ProveedorListComponent,
    // 4. Eliminamos el guardián de aquí
  },
  {
    path: 'reporte-ventas',
    component: ReporteVentasComponent,
    // 5. Eliminamos el guardián de aquí
  },
  // --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 6.9) ---
  {
    path: 'usuarios',
    // Usamos loadComponent para lazy loading del componente que creamos
    loadComponent: () =>
      import('./pages/user-list/user-list.component'),
  },
  // --- 👆 FIN DE LA MODIFICACIÓN ---
];
