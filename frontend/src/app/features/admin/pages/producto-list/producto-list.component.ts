import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Importamos CurrencyPipe
import { ProductoService } from '../../../../core/services/producto.service';
import { Producto } from '../../../../core/models/producto.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip'; // Para "tooltips" en los iconos

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe, // Añadido para formato de moneda
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  // Cambiamos a templateUrl y styleUrl
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.scss',
})
export default class ProductoListComponent implements OnInit, AfterViewInit {

  // Columnas que se mostrarán en la tabla
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

  // Obtenemos referencias al paginador y al ordenador de la plantilla
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Inyectamos el servicio
  constructor(private productoService: ProductoService) {
    this.dataSource = new MatTableDataSource(this.productos);
  }

  ngOnInit(): void {
    // Cuando el componente se inicia, cargamos los productos
    this.cargarProductos();
  }

  ngAfterViewInit(): void {
    // Conectamos el paginador y el ordenador al dataSource
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
        // Aquí podrías mostrar una notificación de error (ej. MatSnackBar)
      },
    });
  }

  abrirDialogoProducto(): void {
    // Lógica para el botón "Nuevo Producto" (próxima tarea)
    console.log('Abrir diálogo para crear producto...');
  }

  editarProducto(producto: Producto): void {
    // Lógica para el botón "Editar" (próxima tarea)
    console.log('Abrir diálogo para editar producto:', producto);
  }

  eliminarProducto(id: number): void {
    // Lógica para el botón "Eliminar" (próxima tarea)
    console.log('Abrir diálogo para confirmar eliminación de ID:', id);
  }
}
