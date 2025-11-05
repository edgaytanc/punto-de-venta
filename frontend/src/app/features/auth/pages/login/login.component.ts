// Eliminamos 'NgZone' de las importaciones
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { Login } from '../../../../core/models/login.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  // Inyección de servicios
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);
  private router = inject(Router);
  // private zone = inject(NgZone); // <-- Eliminado

  // Estado
  public hidePassword = true;
  public isLoading = false;
  public loginError: string | null = null;

  // Formulario
  public loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Maneja el envío del formulario de login.
   */
  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.loginError = null;

    const loginData: Login = this.loginForm.value;

    this.authService
      .login(loginData)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          // Ya no necesitamos 'zone.run()'. La navegación directa funcionará
          // porque el guardián (auth.guard.ts) ahora es síncrono.
          this.router.navigate(['/app/pos']);
        },
        error: (err: HttpErrorResponse) => {
          console.error('ERROR de login. Detalles:', err);
          if (err.status === 401) {
            this.loginError = 'Usuario o contraseña incorrectos.';
          } else if (err.error && typeof err.error === 'string') {
             this.loginError = err.error;
          } else {
            this.loginError = 'Error al conectar con el servidor.';
          }
        },
      });
  }

  /**
   * Obtiene el mensaje de error para un campo del formulario.
   */
  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido.';
    }
    if (control?.hasError('minlength')) {
      return 'Debe tener al menos 6 caracteres.';
    }
    return '';
  }
}
