//USING MODULAR FIREBASE SDKS, SO YOU MUST IMPORT ALL NEEDED IMPORTS

import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, User, signOut, onAuthStateChanged } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
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

  private db = getFirestore(this.app);
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
  }

  //AUTHORIZATION FUNCTIONS
  registerOrganization(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(userCredential => {
        this.sendVerificationEmail(userCredential.user);
        return userCredential;
      });
  }

  login(email: string, password: string){
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  private sendVerificationEmail(user: any) {
    return sendEmailVerification(user);
  }

  //DATBASE FUNCTIONS
  addOrganization(organization: any, documentId: string) {
    console.log("we are going to add the following organization: " + organization)
    const orgRef = doc(this.db, "organizations", documentId);
    return setDoc(orgRef, organization);
  }

  updateOrganizationStatus(orgId: string, status: boolean) {
    const orgRef = doc(this.db, "organizations", orgId);
    return updateDoc(orgRef, { status: status });
  }

  async getUserDataByEmail(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, async (user) => {
        if (user && user.email === email) {
          const userDocRef = doc(this.db, 'organizations', email);  // Assumes 'users' collection uses email as the document ID
          try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              resolve(docSnap.data());  // Return the user data
            } else {
              console.log('No such document!');
              resolve(null);  // No document found
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            reject(error);  // Propagate error
          }
        } else {
          console.log('No logged in user or email mismatch');
          resolve(null);  // No logged-in user or email mismatch
        }
      });
    });
  }

  

  
}