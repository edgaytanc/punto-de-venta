import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { Categoria } from '../../../../core/models/categoria.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../../core/components/confirm-dialog/confirm-dialog.component';
import { CategoriaDialogComponent } from '../../components/categoria-dialog/categoria-dialog.component';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './categoria-list.component.html',
  styleUrl: './categoria-list.component.scss',
})
export default class CategoriaListComponent implements OnInit, AfterViewInit {

  // Columnas más simples
  displayedColumns: string[] = ['id', 'nombre', 'acciones'];
  dataSource: MatTableDataSource<Categoria>;
  categorias: Categoria[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private categoriaService: CategoriaService, // Usamos CategoriaService
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource(this.categorias);
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({ // Llamada a getCategorias
      next: (data) => {
        this.categorias = data;
        this.dataSource.data = this.categorias;
      },
      error: (err) => {
        this.mostrarNotificacion('Error al cargar categorías');
      },
    });
  }

  abrirDialogoCategoria(): void {
    const dialogRef = this.dialog.open(CategoriaDialogComponent, { // Abre CategoriaDialog
      width: '450px',
      data: { categoria: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { id, ...nuevaCategoria } = result;

        this.categoriaService.createCategoria(nuevaCategoria).subscribe({ // Llama a createCategoria
          next: () => {
            this.mostrarNotificacion('Categoría Creada');
            this.cargarCategorias();
          },
          error: (err) => this.mostrarNotificacion('Error al crear categoría')
        });
      }
    });
  }

  editarCategoria(categoria: Categoria): void {
    const dialogRef = this.dialog.open(CategoriaDialogComponent, { // Abre CategoriaDialog
      width: '450px',
      data: { categoria: categoria }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoriaService.updateCategoria(result.id, result).subscribe({ // Llama a updateCategoria
          next: () => {
            this.mostrarNotificacion('Categoría Actualizada');
            this.cargarCategorias();
          },
          error: (err) => this.mostrarNotificacion('Error al actualizar categoría')
        });
      }
    });
  }

  eliminarCategoria(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { // Reutilizamos ConfirmDialog
      width: '400px',
      data: {
        title: 'Confirmar Eliminación',
        message: '¿Estás seguro de que deseas eliminar esta categoría?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoriaService.deleteCategoria(id).subscribe({ // Llama a deleteCategoria
          next: () => {
            this.mostrarNotificacion('Categoría Eliminada');
            this.cargarCategorias();
          },
          error: (err) => this.mostrarNotificacion('Error al eliminar categoría')
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
