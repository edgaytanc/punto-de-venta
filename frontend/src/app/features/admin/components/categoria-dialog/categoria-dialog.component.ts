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
import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-categoria-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './categoria-dialog.component.html',
  styleUrl: './categoria-dialog.component.scss',
})
export class CategoriaDialogComponent implements OnInit {
  categoriaForm: FormGroup;
  isEditMode: boolean = false;
  tituloDialogo: string = 'Nueva Categoría';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CategoriaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categoria: Categoria }
  ) {
    this.categoriaForm = this.fb.group({
      id: [0],
      nombreCategoria: ['', Validators.required], // <-- CAMBIO AQUÍ
      descripcion: [''],                         // <-- AÑADIDO (No requerido por ahora)
    });

    if (data && data.categoria) {
      this.isEditMode = true;
      this.tituloDialogo = 'Editar Categoría';
      this.categoriaForm.patchValue(data.categoria);
    }
  }

  ngOnInit(): void {}

  onGuardar(): void {
    if (this.categoriaForm.valid) {
      this.dialogRef.close(this.categoriaForm.value);
    } else {
      this.categoriaForm.markAllAsTouched();
    }
  }

  onCancelar(): void {
    this.dialogRef.close();
  }
}
