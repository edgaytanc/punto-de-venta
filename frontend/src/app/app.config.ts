import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// 1. Importa 'withInterceptors' (modificación) y tu interceptor (nuevo)
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './core/interceptors/token.interceptor';

// --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 8.1) ---
import { DatePipe } from '@angular/common';
// --- 👆 FIN DE LA MODIFICACIÓN ---

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideAnimationsAsync(), // Esto lo añadió Angular Material

    // 2. Modifica esta línea:
    provideHttpClient(withInterceptors([tokenInterceptor])),
    // --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 8.1) ---
    // Añadimos DatePipe a los providers de la aplicación
    DatePipe,
    // --- 👆 FIN DE LA MODIFICACIÓN ---
  ]
};
