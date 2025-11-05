import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet], // Importamos RouterOutlet para que pueda renderizar las rutas hijas (login)
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],
})
export default class AuthLayoutComponent {
  // No se necesita lógica aquí, es solo un contenedor visual.
}
