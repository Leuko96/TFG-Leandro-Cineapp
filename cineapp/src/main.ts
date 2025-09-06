import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';


// import { getAnalytics } from "firebase/analytics";
// import { getFirestore } from "firebase/firestore";
import { environment } from './enviroments/environment';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';// Inicializa Firebase
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';
// export const db = getFirestore(app);

// const analytics = getAnalytics(app);
bootstrapApplication(AppComponent, {
  providers: [
  provideHttpClient(),
  provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
  provideAuth(() => getAuth()),
  provideFirestore(() => getFirestore()),
  provideAnimations(), 
  provideRouter(routes)
  ]
}).catch(err => console.error(err));