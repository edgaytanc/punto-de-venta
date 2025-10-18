import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

// Interfaz para los datos que recibirá el diálogo
export interface ConfirmDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  // Inyectamos los datos (título y mensaje) y la referencia al diálogo
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancelar(): void {
    // Cierra el diálogo y devuelve 'false' (cancelado)
    this.dialogRef.close(false);
  }

  onConfirmar(): void {
    // Cierra el diálogo y devuelve 'true' (confirmado)
    this.dialogRef.close(true);
  }
}
