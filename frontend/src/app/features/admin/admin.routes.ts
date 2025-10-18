import { Routes } from '@angular/router';
import ProductoListComponent from './pages/producto-list/producto-list.component';

export const ADMIN_ROUTES: Routes = [
  // Cuando alguien entre a /admin, redirigir a /admin/productos
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'productos',
  },

  // Ruta /admin/productos
  {
    path: 'productos',
    component: ProductoListComponent,
  },

  // Rutas para categorías y proveedores (las definiremos más tarde)
  {
    path: 'categorias',
    // component: CategoriaListComponent
    redirectTo: 'productos', // Temporal
  },
  {
    path: 'proveedores',
    // component: ProveedorListComponent
    redirectTo: 'productos', // Temporal
  },
];
