import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
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
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject, finalize, tap } from 'rxjs';

import { Venta } from '../../../../core/models/venta.model';
import { VentaService } from '../../../../core/services/venta.service';
import VentaDetalleDialogComponent from '../../components/venta-detalle-dialog/venta-detalle-dialog.component';

import { ReceiptService } from '../../../../core/services/receipt.service';

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
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './reporte-ventas.component.html',
  styleUrls: ['./reporte-ventas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteVentasComponent implements OnInit {
  // Inyección de servicios
  private ventaService = inject(VentaService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  private receiptService = inject(ReceiptService);

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
      this.snackBar.open('Debe seleccionar una fecha de inicio y fin.', 'Cerrar', { duration: 3000 });
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
   * Obtiene el detalle completo de la venta y abre un diálogo.
   */
  verDetalle(idVenta: number): void {
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
   * Obtiene los datos de una venta y genera un recibo PDF para reimpresión.
   */
  onReimprimirRecibo(idVenta: number): void {
    this.snackBar.open('Generando recibo PDF...', 'Cerrar', { duration: 2000 });
    this.isLoading.next(true); // Activar spinner global

    this.ventaService.getVentaById(idVenta).pipe(
      finalize(() => this.isLoading.next(false)) // Desactivar spinner al finalizar
    ).subscribe({
      next: (ventaDetallada: Venta) => {
        try {
          // Llamar al servicio de recibos con los datos completos
          this.receiptService.generateVentaReceipt(ventaDetallada);
        } catch (pdfError) {
          console.error("Error al generar el PDF:", pdfError);
          this.handleError(pdfError, 'generar el recibo PDF');
        }
      },
      error: (err) => this.handleError(err, 'cargar la venta para reimprimir')
    });
  }

  // --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 8.3) ---
  /**
   * Genera un PDF con los datos que se muestran actualmente en la tabla.
   */
  onImprimirReporte(): void {
    // 1. Obtener los datos actuales de la tabla
    // Usamos .data porque las funciones de filtro/carga actualizan esta propiedad.
    const datosParaImprimir = this.ventasDataSource.data;

    // 2. Verificar si hay datos
    if (datosParaImprimir.length === 0) {
      this.snackBar.open('No hay datos en la tabla para imprimir.', 'Cerrar', {
        duration: 3000,
        panelClass: 'snack-warn' // Clase de advertencia
      });
      return;
    }

    // 3. Obtener las fechas del formulario para el subtítulo del PDF
    const { fechaInicio, fechaFin } = this.filtroForm.value;

    // 4. Llamar al servicio
    try {
      this.receiptService.generateVentasReport(datosParaImprimir, fechaInicio, fechaFin);
      this.snackBar.open('Generando reporte PDF...', 'Cerrar', {
        duration: 2000,
        panelClass: 'snack-success'
      });
    } catch (pdfError) {
      console.error("Error al generar el reporte PDF:", pdfError);
      this.handleError(pdfError, 'generar el reporte PDF');
    }
  }
  // --- 👆 FIN DE LA MODIFICACIÓN ---


  /**
   * Manejador centralizado de errores.
   */
  private handleError(error: any, accion: string): void {
    console.error(`Error al ${accion}:`, error);
    this.snackBar.open(`Error al ${accion}. Intente de nuevo.`, 'Cerrar', {
      duration: 4000,
      panelClass: 'snack-error' // Asegúrate de tener esta clase en styles.scss
    });
  }
}
