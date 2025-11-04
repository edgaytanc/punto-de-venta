import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';

import { Venta } from '../../../../core/models/venta.model';
import { DetalleVenta } from '../../../../core/models/detalle-venta.model';

@Component({
  selector: 'app-venta-detalle-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatListModule,
  ],
  templateUrl: './venta-detalle-dialog.component.html',
  styleUrls: ['./venta-detalle-dialog.component.scss'],
})
export default class VentaDetalleDialogComponent {
  // Inyectamos los datos que pasamos al abrir el diálogo
  public data: Venta = inject(MAT_DIALOG_DATA);
  public dialogRef = inject(MatDialogRef<VentaDetalleDialogComponent>);

  // Columnas para la tabla de productos
  public detalleDisplayedColumns: string[] = [
    'nombreProducto',
    'cantidad',
    'precioUnitario',
    'subtotal',
  ];

  // DataSource para la tabla de detalles
  public detalleDataSource: DetalleVenta[] = this.data.detalles || [];

  /**
   * Cierra el diálogo.
   */
  cerrar(): void {
    this.dialogRef.close();
  }
}
