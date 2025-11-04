import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router'; // Router ya no se usa para 'verDetalle'
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BehaviorSubject, finalize, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog'; // <-- AÑADIDO: Importar MatDialog

import { Venta } from '../../../../core/models/venta.model';
import { VentaService } from '../../../../core/services/venta.service';
// <-- AÑADIDO: Importar el nuevo componente de diálogo
import VentaDetalleDialogComponent from '../../components/venta-detalle-dialog/venta-detalle-dialog.component';

@Component({
  selector: 'app-reporte-ventas',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    // El diálogo se importa dinámicamente, no es necesario añadirlo aquí
  ],
  templateUrl: './reporte-ventas.component.html',
  styleUrls: ['./reporte-ventas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteVentasComponent implements OnInit {
  // Inyección de servicios
  private ventaService = inject(VentaService);
  private dialog = inject(MatDialog); // <-- AÑADIDO: Inyectar MatDialog
  // private router = inject(Router); // <-- ELIMINADO: Ya no se usa para el detalle

  // Estado de carga
  public isLoading = new BehaviorSubject<boolean>(true);

  // Datos para la tabla
  public ventasDataSource = new MatTableDataSource<Venta>();
  public displayedColumns: string[] = [
    'id',
    'fechaVenta',
    'nombreCliente',
    'nombreUsuario',
    'totalVenta',
    'acciones',
  ];

  // Formulario para filtros
  public filtroForm = new FormGroup({
    fechaInicio: new FormControl<Date | null>(null),
    fechaFin: new FormControl<Date | null>(null),
  });

  ngOnInit(): void {
    this.cargarVentas();
  }

  /**
   * Carga todas las ventas (sin filtro).
   */
  cargarVentas(): void {
    this.isLoading.next(true);
    this.ventaService
      .getVentas()
      .pipe(
        tap((ventas) => (this.ventasDataSource.data = ventas)),
        finalize(() => this.isLoading.next(false))
      )
      .subscribe({
        error: (err) => this.handleError(err, 'cargar las ventas'),
      });
  }

  /**
   * Aplica los filtros de fecha seleccionados.
   */
  aplicarFiltros(): void {
    const { fechaInicio, fechaFin } = this.filtroForm.value;

    if (!fechaInicio || !fechaFin) {
      console.warn('Se requieren ambas fechas para filtrar.');
      return;
    }

    const inicio = fechaInicio.toISOString().split('T')[0];
    const fin = fechaFin.toISOString().split('T')[0];

    this.isLoading.next(true);
    this.ventaService
      .getVentasPorFecha(inicio, fin)
      .pipe(
        tap((ventas) => (this.ventasDataSource.data = ventas)),
        finalize(() => this.isLoading.next(false))
      )
      .subscribe({
        error: (err) => this.handleError(err, 'filtrar las ventas por fecha'),
      });
  }

  /**
   * Limpia los filtros y recarga todas las ventas.
   */
  limpiarFiltros(): void {
    this.filtroForm.reset();
    this.cargarVentas();
  }

  /**
   * MODIFICADO:
   * Obtiene el detalle completo de la venta y abre un diálogo.
   */
  verDetalle(idVenta: number): void {
    // Ya no navegamos
    // this.router.navigate(['/admin/reporte-detalle', idVenta]);

    this.isLoading.next(true); // Usamos el spinner principal
    this.ventaService
      .getVentaById(idVenta)
      .pipe(finalize(() => this.isLoading.next(false)))
      .subscribe({
        next: (ventaDetallada) => {
          // Abrimos el diálogo y le pasamos los datos completos
          this.dialog.open(VentaDetalleDialogComponent, {
            width: '700px',
            maxWidth: '90vw',
            data: ventaDetallada, // Pasamos la venta completa al diálogo
          });
        },
        error: (err) => this.handleError(err, 'cargar el detalle de la venta'),
      });
  }

  /**
   * Manejador centralizado de errores.
   */
  private handleError(error: any, accion: string): void {
    console.error(`Error al ${accion}:`, error);
    // Aquí podríamos mostrar una notificación al usuario (ej. MatSnackBar)
  }
}

