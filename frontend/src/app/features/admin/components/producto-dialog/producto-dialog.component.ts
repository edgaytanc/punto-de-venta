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
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProveedorService } from '../../../../core/services/proveedor.service';
import { Categoria } from '../../../../core/models/categoria.model';
import { Proveedor } from '../../../../core/models/proveedor.model';
import { Producto } from '../../../../core/models/producto.model';

@Component({
  selector: 'app-producto-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './producto-dialog.component.html',
  styleUrl: './producto-dialog.component.scss',
})
export class ProductoDialogComponent implements OnInit {
  productoForm: FormGroup;
  categorias: Categoria[] = [];
  proveedores: Proveedor[] = [];
  isEditMode: boolean = false;
  tituloDialogo: string = 'Nuevo Producto';

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private proveedorService: ProveedorService,
    public dialogRef: MatDialogRef<ProductoDialogComponent>,
    // Inyectamos MAT_DIALOG_DATA para recibir el producto a editar
    @Inject(MAT_DIALOG_DATA) public data: { producto: Producto }
  ) {
    // Definimos la estructura del formulario y sus validaciones
    this.productoForm = this.fb.group({
      id: [0],
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      costo: [0, [Validators.required, Validators.min(0)]],
      stockActual: [0, [Validators.required, Validators.min(0)]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
      categoriaProductoId: [null, Validators.required],
      proveedorId: [null, Validators.required],
    });

    // Verificamos si recibimos un producto (modo edición)
    if (data && data.producto) {
      this.isEditMode = true;
      this.tituloDialogo = 'Editar Producto';
      // Rellenamos el formulario con los datos del producto
      this.productoForm.patchValue(data.producto);
    }
  }

  ngOnInit(): void {
    // Cargamos los desplegables al iniciar el diálogo
    this.cargarCategorias();
    this.cargarProveedores();
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe((data) => {
      this.categorias = data;
    });
  }

  cargarProveedores(): void {
    this.proveedorService.getProveedores().subscribe((data) => {
      this.proveedores = data;
    });
  }

  onGuardar(): void {
    if (this.productoForm.valid) {
      // Si el formulario es válido, cerramos el diálogo y enviamos los datos
      this.dialogRef.close(this.productoForm.value);
    } else {
      // Opcional: marcar campos como "tocados" para mostrar errores
      this.productoForm.markAllAsTouched();
    }
  }

  onCancelar(): void {
    // Cerramos el diálogo sin enviar nada
    this.dialogRef.close();
  }
}
