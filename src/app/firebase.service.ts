//USING MODULAR FIREBASE SDKS, SO YOU MUST IMPORT ALL NEEDED IMPORTS

import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, User, signOut, onAuthStateChanged } from 'firebase/auth';
import { Observable, from } from 'rxjs';

import { Functions, httpsCallable, getFunctions } from 'firebase/functions';




@Injectable({
  providedIn: 'root'
})

export class FirebaseService {

  private functions: Functions;

  private app = initializeApp({
    apiKey: "AIzaSyC3yk4qTGPIaDqZ8CYVnNCkaQI3EEkmlXg",
    authDomain: "eaglescoutwebsite.firebaseapp.com",
    projectId: "eaglescoutwebsite",
    storageBucket: "eaglescoutwebsite.appspot.com",
    messagingSenderId: "337165863245",
    appId: "1:337165863245:web:747ea9574211913cb7cf04",
    measurementId: "G-ZPXTERDPQL"
  });

  public user$: Observable<User | null>;
  private auth = getAuth(this.app);

  constructor() {

    this.user$ = new Observable<User | null>((subscriber) => {
      // This function is called whenever the observable is subscribed to
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        // Push the new user state to the observable's subscribers
        subscriber.next(user);
      });

      // Return a cleanup function that will be called when the observable is unsubscribed
      return () => unsubscribe();
    });

    this.functions = getFunctions(this.app);
  }

 //AUTHORIZATION FUNCTIONS
 login(email: string, password: string){
   return signInWithEmailAndPassword(this.auth, email, password);
 }

 logout() {
   return signOut(this.auth);
 }

 //DATBASE FUNCTIONS

  addOrganization(data: any): Observable<any> {
    console.log(JSON.stringify(data));
    const addOrganizationFn = httpsCallable(this.functions, 'addOrganization');
    return from(addOrganizationFn(data));
  }

  getOrganizationByEmail(email: string): Observable<any> {
    const getOrg = httpsCallable(this.functions, 'getOrganizationByEmail');
    return from(getOrg({ email }));
  }
}

  
