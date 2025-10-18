import { Routes } from '@angular/router';
import ProductoListComponent from './pages/producto-list/producto-list.component';
import CategoriaListComponent from './pages/categoria-list/categoria-list.component';
// 1. Importamos el nuevo componente de lista
import ProveedorListComponent from './pages/proveedor-list/proveedor-list.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'productos',
  },
  {
    path: 'productos',
    component: ProductoListComponent,
  },
  {
    path: 'categorias',
    component: CategoriaListComponent,
  },

  // 2. Actualizamos la ruta de proveedores
  {
    path: 'proveedores',
    component: ProveedorListComponent, // Ya no es un redirect
  },
];
