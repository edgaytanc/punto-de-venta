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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductoDialogComponent } from '../../components/producto-dialog/producto-dialog.component';

// 1. Importamos el nuevo diálogo de confirmación
import { ConfirmDialogComponent } from '../../../../core/components/confirm-dialog/confirm-dialog.component';

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
    MatDialogModule,
    MatSnackBarModule,
    // (No es necesario importar ConfirmDialogComponent aquí porque se carga dinámicamente)
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

  abrirDialogoProducto(): void {
    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '600px',
      data: { producto: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { id, ...nuevoProducto } = result;

        this.productoService.createProducto(nuevoProducto).subscribe({
          next: () => {
            this.mostrarNotificacion('Producto Creado');
            this.cargarProductos();
          },
          error: (err) => {
            this.mostrarNotificacion('Error al crear producto');
            console.error(err);
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
        this.productoService.updateProducto(result.id, result).subscribe({
          next: () => {
            this.mostrarNotificacion('Producto Actualizado');
            this.cargarProductos();
          },
          error: (err) => {
            this.mostrarNotificacion('Error al actualizar producto');
            console.error(err);
          }
        });
      }
    });
  }

  // 2. LÓGICA DE ELIMINACIÓN ACTUALIZADA
  eliminarProducto(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Eliminación',
        message: '¿Estás seguro de que deseas eliminar este producto?'
      }
    });

    // 3. Escuchamos el resultado del diálogo
    dialogRef.afterClosed().subscribe(result => {
      // Si el usuario confirmó (result === true)
      if (result) {
        this.productoService.deleteProducto(id).subscribe({
          next: () => {
            this.mostrarNotificacion('Producto Eliminado');
            this.cargarProductos(); // Recargamos la tabla
          },
          error: (err) => {
            this.mostrarNotificacion('Error al eliminar producto');
            console.error(err);
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
