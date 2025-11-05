import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    // Todas las importaciones de MatSidenavModule, MatToolbarModule, etc., se eliminan
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  // Toda la lógica de menús, authService, observables e inyecciones se elimina.
  // Dejamos solo el componente raíz limpio.
}
