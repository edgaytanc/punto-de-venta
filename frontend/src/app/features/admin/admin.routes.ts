import { Routes } from '@angular/router';
import ProductoListComponent from './pages/producto-list/producto-list.component';
import CategoriaListComponent from './pages/categoria-list/categoria-list.component';
import ProveedorListComponent from './pages/proveedor-list/proveedor-list.component';

// 1. Importamos el guardián que creamos
import { authGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'productos',
  },
  {
    path: 'productos',
    component: ProductoListComponent,
    // 2. Añadimos el guardián
    canActivate: [authGuard],
  },
  {
    path: 'categorias',
    component: CategoriaListComponent,
    // 3. Añadimos el guardián
    canActivate: [authGuard],
  },
  {
    path: 'proveedores',
    component: ProveedorListComponent,
    // 4. Añadimos el guardián
    canActivate: [authGuard],
  },
];
