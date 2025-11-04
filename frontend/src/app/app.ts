import { Component, inject, signal } from '@angular/core'; // <-- Importar signal
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  title = 'Punto de Venta';
  public authService = inject(AuthService);
  private router = inject(Router);

  // --- INICIO DE CÓDIGO MODIFICADO ---
  // Exponemos los observables del servicio para usarlos en la plantilla con el pipe async
  public isAuthenticated$ = this.authService.isLoggedIn;
  public currentUser$ = this.authService.currentUser$;
  // --- FIN DE CÓDIGO MODIFICADO ---

  // Señal para el estado del menú principal (sidenav)
  private menuAbiertoSignal = signal(true); // Inicia abierto
  public menuAbierto = this.menuAbiertoSignal.asReadonly();

  // Señal para el estado del submenú de administración
  private menuAdministracionAbiertoSignal = signal(true); // Inicia abierto
  public menuAdministracionAbierto =
    this.menuAdministracionAbiertoSignal.asReadonly();

  /**
   * Alterna la visibilidad del menú lateral principal.
   */
  toggleMenu(): void {
    this.menuAbiertoSignal.update((abierto) => !abierto);
  }

  /**
   * Alterna la visibilidad del submenú de administración.
   */
  toggleMenuAdministracion(): void {
    this.menuAdministracionAbiertoSignal.update((abierto) => !abierto);
  }
  // --- FIN DE CÓDIGO AÑADIDO ---

  /**
   * Cierra la sesión del usuario y redirige al login.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
