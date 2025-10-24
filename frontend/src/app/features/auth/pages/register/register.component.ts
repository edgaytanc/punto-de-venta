import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { Register } from '../../../../core/models/register.model';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Validador personalizado para asegurar que las contraseñas coincidan.
 */
function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password?.value !== confirmPassword?.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  // Inyección de servicios
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Propiedades del componente
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  ngOnInit(): void {
    // Inicializamos el formulario reactivo
    this.registerForm = this.fb.group(
      {
        fullName: [''], // Opcional, basado en el modelo
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        // Añadimos el validador a nivel de grupo
        validators: passwordMatchValidator,
      }
    );
  }

  /**
   * Maneja el envío del formulario de registro.
   */
  onSubmit(): void {
    // Si el formulario no es válido, no hacer nada
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Mostrar indicador de carga y limpiar errores previos
    this.isLoading = true;
    this.errorMessage = null;

    // Excluimos 'confirmPassword' del objeto a enviar
    const { confirmPassword, ...userInfo } = this.registerForm.value;
    const registerData: Register = userInfo;

    // Llamar al servicio de autenticación
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Redirigir al dashboard de admin o al POS al registrarse
        this.router.navigate(['/admin']);
        console.log('Registro exitoso:', response);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        // Manejo de errores
        if (err.status === 400 || err.status === 409) {
          // Asumiendo 409 (Conflict) si el email/usuario ya existe
          this.errorMessage =
            'El email o nombre de usuario ya está en uso. Intente con otro.';
        } else {
          this.errorMessage =
            'Ocurrió un error inesperado. Por favor, intente más tarde.';
        }
        console.error('Error en registro:', err);
      },
    });
  }
}
