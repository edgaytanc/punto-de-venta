import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProveedorService } from '../../../../core/services/proveedor.service'; // Servicio de Proveedor
import { Proveedor } from '../../../../core/models/proveedor.model';
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
import { ProveedorDialogComponent } from '../../components/proveedor-dialog/proveedor-dialog.component'; // Diálogo de Proveedor

@Component({
  selector: 'app-proveedor-list',
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
  templateUrl: './proveedor-list.component.html',
  styleUrl: './proveedor-list.component.scss',
})
export default class ProveedorListComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['id', 'nombre', 'contacto', 'telefono', 'acciones'];
  dataSource: MatTableDataSource<Proveedor>;
  proveedores: Proveedor[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private proveedorService: ProveedorService, // Usamos ProveedorService
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource(this.proveedores);
  }

  ngOnInit(): void {
    this.cargarProveedores();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarProveedores(): void {
    this.proveedorService.getProveedores().subscribe({ // Llamada a getProveedores
      next: (data) => {
        this.proveedores = data;
        this.dataSource.data = this.proveedores;
      },
      error: (err) => {
        this.mostrarNotificacion('Error al cargar proveedores');
      },
    });
  }

  abrirDialogoProveedor(): void {
    const dialogRef = this.dialog.open(ProveedorDialogComponent, { // Abre ProveedorDialog
      width: '600px',
      data: { proveedor: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { id, ...nuevoProveedor } = result;

        this.proveedorService.createProveedor(nuevoProveedor).subscribe({ // Llama a createProveedor
          next: () => {
            this.mostrarNotificacion('Proveedor Creado');
            this.cargarProveedores();
          },
          error: (err) => this.mostrarNotificacion('Error al crear proveedor')
        });
      }
    });
  }

  editarProveedor(proveedor: Proveedor): void {
    const dialogRef = this.dialog.open(ProveedorDialogComponent, { // Abre ProveedorDialog
      width: '600px',
      data: { proveedor: proveedor }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.proveedorService.updateProveedor(result.id, result).subscribe({ // Llama a updateProveedor
          next: () => {
            this.mostrarNotificacion('Proveedor Actualizado');
            this.cargarProveedores();
          },
          error: (err) => this.mostrarNotificacion('Error al actualizar proveedor')
        });
      }
    });
  }

  eliminarProveedor(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { // Reutilizamos ConfirmDialog
      width: '400px',
      data: {
        title: 'Confirmar Eliminación',
        message: '¿Estás seguro de que deseas eliminar este proveedor?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.proveedorService.deleteProveedor(id).subscribe({ // Llama a deleteProveedor
          next: () => {
            this.mostrarNotificacion('Proveedor Eliminado');
            this.cargarProveedores();
          },
          error: (err) => this.mostrarNotificacion('Error al eliminar proveedor')
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
