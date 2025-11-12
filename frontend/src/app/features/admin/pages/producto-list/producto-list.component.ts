// ... (imports sin cambios) ...
import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ProductoService } from '../../../../core/services/producto.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Producto } from '../../../../core/models/producto.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProductoDialogComponent } from '../../components/producto-dialog/producto-dialog.component';
import { ConfirmDialogComponent } from '../../../../core/components/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.scss',
})
export default class ProductoListComponent implements OnInit, AfterViewInit {

  // Observable para verificar si el usuario es admin
  private authService = inject(AuthService);
  public isAdmin$: Observable<boolean> = this.authService.currentUser$.pipe(
    map(user => user?.roles?.includes('Admin') ?? false)
  );

  // FormControl para el buscador
  public searchControl = new FormControl('');

  // ---- AJUSTES EN COLUMNAS ----
  displayedColumns: string[] = [
    'id',
    'nombreProducto', // <-- CAMBIO
    // 'imagenUrl', // Opcional si quieres mostrarla
    'precio',
    'stock', // <-- CAMBIO
    'acciones',
  ];
  // ---- FIN AJUSTES ----

  dataSource: MatTableDataSource<Producto>;
  productos: Producto[] = [];

  // ... (resto del TS sin cambios funcionales, solo nombres de propiedad si aplica) ...
   @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private productoService: ProductoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource(this.productos);
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.configurarBuscador();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Configura el buscador para filtrar productos
   */
  configurarBuscador(): void {
    this.searchControl.valueChanges.subscribe(searchValue => {
      this.applyFilter(searchValue || '');
    });
  }

  /**
   * Aplica el filtro a la tabla de productos
   */
  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  cargarProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.dataSource.data = this.productos;
        console.log('Productos cargados:', data); // Log para depurar
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.mostrarNotificacion('Error al cargar productos');
      },
    });
  }

  abrirDialogoProducto(): void {
    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '600px',
      data: { producto: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { id, ...nuevoProducto } = result;
        // Asegúrate que el objeto que envías coincida con lo que espera el backend
        // Si el backend espera IdCategoria/IdProveedor, ya está correcto.
        this.productoService.createProducto(nuevoProducto as Omit<Producto, 'id'>).subscribe({
          next: () => {
            this.mostrarNotificacion('Producto Creado');
            this.cargarProductos();
          },
          error: (err) => {
            console.error('Error al crear producto:', err);
            this.mostrarNotificacion('Error al crear producto');
          }
        });
      }
    });
  }

  editarProducto(producto: Producto): void {
    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '600px',
      data: { producto: producto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
         // Asegúrate que el objeto que envías coincida con lo que espera el backend
         // Si el backend espera IdCategoria/IdProveedor, ya está correcto.
        this.productoService.updateProducto(result.id, result).subscribe({
          next: () => {
            this.mostrarNotificacion('Producto Actualizado');
            this.cargarProductos();
          },
          error: (err) => {
            console.error('Error al actualizar producto:', err);
            this.mostrarNotificacion('Error al actualizar producto');
          }
        });
      }
    });
  }

  eliminarProducto(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Eliminación',
        message: '¿Estás seguro de que deseas eliminar este producto?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productoService.deleteProducto(id).subscribe({
          next: () => {
            this.mostrarNotificacion('Producto Eliminado');
            this.cargarProductos();
          },
          error: (err) => {
            console.error('Error al eliminar producto:', err);
            this.mostrarNotificacion('Error al eliminar producto');
          }
        });
      }
    });
  }

  mostrarNotificacion(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
    });
  }
}
