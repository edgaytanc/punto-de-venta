import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuarioDetalle, UsuarioCreate, UsuarioUpdate } from '../../../../core/models/user.model';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { finalize } from 'rxjs';

/**
 * Validador personalizado para asegurar que las contraseñas coincidan.
 */
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    // Asigna el error al control 'confirmPassword'
    confirmPassword.setErrors({ mismatch: true });
    return { mismatch: true };
  } else {
    // Si coinciden, y 'confirmPassword' tiene el error, límpialo (si no hay otros errores)
    if (confirmPassword?.hasError('mismatch')) {
       confirmPassword.setErrors(null);
    }
    return null;
  }
};


@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {

  // Servicios
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);
  public dialogRef = inject(MatDialogRef<UserDialogComponent>);

  // Datos y estado
  public form: FormGroup;
  public isEditMode: boolean;
  public rolesDisponibles: string[] = [];
  public isLoading: boolean = false;
  private currentUserId: number | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { usuario?: UsuarioDetalle, roles: string[] }
  ) {
    this.isEditMode = !!data.usuario;
    this.rolesDisponibles = data.roles;
    this.currentUserId = data.usuario?.id;

    // --- Construcción del Formulario ---
    this.form = this.fb.group({
      // Username: deshabilitado en modo edición
      username: [{value: '', disabled: this.isEditMode}, [Validators.required, Validators.minLength(3)]],

      // Email
      email: ['', [Validators.required, Validators.email]],

      // Estado (solo visible en modo edición)
      estado: [true],

      // Roles
      roles: [[], [Validators.required]],

      // Password (solo requerido en modo creación)
      password: ['', [Validators.minLength(6)]],

      // Confirmar Password (solo requerido en modo creación)
      confirmPassword: ['']
    });
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      // --- MODO EDICIÓN ---
      // 1. Rellenar formulario con datos existentes
      if(this.data.usuario) {
        this.form.patchValue({
          username: this.data.usuario.username,
          email: this.data.usuario.email,
          estado: this.data.usuario.estado,
          roles: this.data.usuario.roles
        });
      }

      // 2. Quitar validadores de contraseña
      this.form.get('password')?.clearValidators();
      this.form.get('confirmPassword')?.clearValidators();

    } else {
      // --- MODO CREACIÓN ---
      // 1. Añadir validador de contraseña requerida
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('confirmPassword')?.setValidators([Validators.required]);

      // 2. Añadir validador de coincidencia de contraseñas
      this.form.setValidators(passwordMatchValidator);
    }

    // Actualizar validez
    this.form.get('password')?.updateValueAndValidity();
    this.form.get('confirmPassword')?.updateValueAndValidity();
  }

  onCancel(): void {
    this.dialogRef.close(); // Cierra sin enviar datos (evaluado como 'falsy')
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  private createUser(): void {
    const formValue = this.form.getRawValue(); // getRawValue() incluye campos deshabilitados

    const dto: UsuarioCreate = {
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      roles: formValue.roles
    };

    this.usuarioService.createUsuario(dto).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.snackBar.open('Usuario creado exitosamente.', 'Cerrar', { duration: 3000, panelClass: 'snack-success' });
        this.dialogRef.close(true); // Cierra y devuelve 'true' (para recargar tabla)
      },
      error: (err: HttpErrorResponse) => this.handleApiError(err)
    });
  }

  private updateUser(): void {
    if (!this.currentUserId) {
       this.snackBar.open('Error: ID de usuario no encontrado.', 'Cerrar', { duration: 3000, panelClass: 'snack-error' });
       this.isLoading = false;
       return;
    }

    const formValue = this.form.getRawValue();

    const dto: UsuarioUpdate = {
      email: formValue.email,
      estado: formValue.estado,
      roles: formValue.roles
    };

    this.usuarioService.updateUsuario(this.currentUserId, dto).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.snackBar.open('Usuario actualizado exitosamente.', 'Cerrar', { duration: 3000, panelClass: 'snack-success' });
        this.dialogRef.close(true); // Cierra y devuelve 'true' (para recargar tabla)
      },
      error: (err: HttpErrorResponse) => this.handleApiError(err)
    });
  }

  /**
   * Maneja los errores 400 (Validación) de la API y los muestra en el formulario.
   */
  private handleApiError(error: HttpErrorResponse): void {
    if (error.status === 400 && error.error.errors) {
      // Error de validación del backend
      const validationErrors = error.error.errors;

      Object.keys(validationErrors).forEach(propName => {
        const formControl = this.form.get(propName.toLowerCase());
        if (formControl) {
          // Asigna el primer error de la lista a ese control
          formControl.setErrors({
            serverError: validationErrors[propName][0]
          });
        }
      });

      // Si el error no es de un campo (ej. "Roles")
      if (validationErrors["Roles"]) {
         this.form.get('roles')?.setErrors({ serverError: validationErrors["Roles"][0] });
      }

    } else {
      // Error genérico
      console.error('Error al guardar:', error);
      this.snackBar.open('Error al guardar el usuario. Intente de nuevo.', 'Cerrar', { duration: 3000, panelClass: 'snack-error' });
    }
  }
}
