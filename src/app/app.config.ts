import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimations } from '@angular/platform-browser/animations';
import { getFunctions, provideFunctions } from '@angular/fire/functions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(), 
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(), 
    provideFirebaseApp(() => initializeApp({"projectId":"eaglescoutwebsite","appId":"1:337165863245:web:747ea9574211913cb7cf04","storageBucket":"eaglescoutwebsite.appspot.com","apiKey":"AIzaSyC3yk4qTGPIaDqZ8CYVnNCkaQI3EEkmlXg","authDomain":"eaglescoutwebsite.firebaseapp.com","messagingSenderId":"337165863245","measurementId":"G-ZPXTERDPQL"})), 
    provideAuth(() => getAuth()), 
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),

  ]
};
