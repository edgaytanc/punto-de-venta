import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // Importamos AppComponent en lugar de App

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
