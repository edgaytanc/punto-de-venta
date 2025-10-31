import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { Login } from '../../../../core/models/login.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  // Inyección de servicios
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Propiedades del componente
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  ngOnInit(): void {
    // Inicializamos el formulario reactivo
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Maneja el envío del formulario de login.
   */
  onSubmit(): void {
    // Si el formulario no es válido, no hacer nada
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Marcar campos como tocados para mostrar errores
      return;
    }

    // Mostrar indicador de carga y limpiar errores previos
    this.isLoading = true;
    this.errorMessage = null;

    // Obtener las credenciales del formulario
    const credentials: Login = this.loginForm.value;

    // Llamar al servicio de autenticación
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Redirigir al dashboard de admin o al POS al iniciar sesión
        this.router.navigate(['/admin']);
        console.log('Login exitoso:', response);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        // Manejo de errores
        if (err.status === 401 || err.status === 400) {
          this.errorMessage = 'Email o contraseña incorrectos. Intente de nuevo.';
        } else {
          this.errorMessage =
            'Ocurrió un error inesperado. Por favor, intente más tarde.';
        }
        console.error('Error en login:', err);
      },
    });
  }
}
