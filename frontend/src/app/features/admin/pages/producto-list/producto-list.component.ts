import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProductoService } from '../../../../core/services/producto.service';
import { Producto } from '../../../../core/models/producto.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

// 1. Importaciones necesarias para Diálogos y Notificaciones
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductoDialogComponent } from '../../components/producto-dialog/producto-dialog.component';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDialogModule,    // 2. Añadido
    MatSnackBarModule,  // 2. Añadido
  ],
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.scss',
})
export default class ProductoListComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'id',
    'nombre',
    'precio',
    'costo',
    'stockActual',
    'acciones',
  ];

  dataSource: MatTableDataSource<Producto>;
  productos: Producto[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // 3. Inyectamos MatDialog y MatSnackBar
  constructor(
    private productoService: ProductoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource(this.productos);
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.dataSource.data = this.productos;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.mostrarNotificacion('Error al cargar productos');
      },
    });
  }

  // 4. Lógica para ABRIR DIÁLOGO (Crear)
  abrirDialogoProducto(): void {
    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '600px',
      data: { producto: null } // No enviamos producto (modo Crear)
    });

    dialogRef.afterClosed().subscribe(result => {
      // 'result' contiene el valor del formulario si se guardó
      if (result) {
        // Omitimos el ID para la creación
        const { id, ...nuevoProducto } = result;

        this.productoService.createProducto(nuevoProducto).subscribe({
          next: () => {
            this.mostrarNotificacion('Producto Creado');
            this.cargarProductos(); // Recargamos la tabla
          },
          error: (err) => {
            this.mostrarNotificacion('Error al crear producto');
            console.error(err);
          }
        });
      }
    });
  }

  // 5. Lógica para ABRIR DIÁLOGO (Editar)
  editarProducto(producto: Producto): void {
    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '600px',
      data: { producto: producto } // Enviamos el producto a editar
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // 'result' es el producto actualizado del formulario
        this.productoService.updateProducto(result.id, result).subscribe({
          next: () => {
            this.mostrarNotificacion('Producto Actualizado');
            this.cargarProductos(); // Recargamos la tabla
          },
          error: (err) => {
            this.mostrarNotificacion('Error al actualizar producto');
            console.error(err);
          }
        });
      }
    });
  }

  eliminarProducto(id: number): void {
    // Lógica para el botón "Eliminar" (próxima tarea)
    console.log('Abrir diálogo para confirmar eliminación de ID:', id);
  }

  // 6. Helper para mostrar notificaciones
  mostrarNotificacion(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000, // 3 segundos
    });
  }
}
