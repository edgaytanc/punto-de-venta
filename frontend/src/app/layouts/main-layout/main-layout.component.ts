import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout', // <-- CAMBIADO
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
  templateUrl: './main-layout.component.html', // <-- CAMBIADO
  styleUrls: ['./main-layout.component.scss'], // <-- CAMBIADO
})
export default class MainLayoutComponent { // <-- CAMBIADO
  title = 'Punto de Venta';
  public authService = inject(AuthService);
  private router = inject(Router);

  // Exponemos currentUser$ directamente desde el servicio
  public currentUser$ = this.authService.currentUser$;

  // Derivamos isAuthenticated$ a partir de currentUser$
  public isAuthenticated$ = this.authService.currentUser$.pipe(
    map(user => !!user) // !! convierte el objeto de usuario (o null) en un booleano
  );

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

  /**
   * Cierra la sesión del usuario y redirige al login.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
