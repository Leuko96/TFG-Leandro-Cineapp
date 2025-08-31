import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { environment } from './enviroments/environment';

// Inicializa Firebase
const app = initializeApp(environment.firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);

bootstrapApplication(AppComponent, {
  providers: [provideAnimations(), provideRouter(routes)]
}).catch(err => console.error(err));