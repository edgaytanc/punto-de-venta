import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Proveedor } from '../../../../core/models/proveedor.model';

@Component({
  selector: 'app-proveedor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './proveedor-dialog.component.html',
  styleUrl: './proveedor-dialog.component.scss',
})
export class ProveedorDialogComponent implements OnInit {
  proveedorForm: FormGroup;
  isEditMode: boolean = false;
  tituloDialogo: string = 'Nuevo Proveedor';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProveedorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { proveedor: Proveedor }
  ) {
    this.proveedorForm = this.fb.group({
      id: [0],
      nombreProveedor: ['', Validators.required], // <-- CAMBIO
      contacto: ['', Validators.required],
      telefono: ['', Validators.required],       // <-- CAMBIO (ahora requerido)
      direccion: ['', Validators.required],      // <-- CAMBIO (ahora requerido)
      correo: ['', [Validators.required, Validators.email]], // <-- AÑADIDO con validación de email
    });

    if (data && data.proveedor) {
      this.isEditMode = true;
      this.tituloDialogo = 'Editar Proveedor';
      this.proveedorForm.patchValue(data.proveedor);
    }
  }

  ngOnInit(): void {}

  onGuardar(): void {
    if (this.proveedorForm.valid) {
      this.dialogRef.close(this.proveedorForm.value);
    } else {
      this.proveedorForm.markAllAsTouched();
    }
  }

  onCancelar(): void {
    this.dialogRef.close();
  }
}
