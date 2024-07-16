//USING MODULAR FIREBASE SDKS, SO YOU MUST IMPORT ALL NEEDED IMPORTS

import { Injectable } from '@angular/core';
import { Observable, from, map, BehaviorSubject} from 'rxjs';

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, User, signOut, onAuthStateChanged } from 'firebase/auth';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getFirestore, DocumentReference} from 'firebase/firestore';

import { Organization } from './organization';
import { Post } from './post';
import firebaseConfig from '../app/firebase-config.json';

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {


  private app: FirebaseApp = initializeApp(firebaseConfig);

  private auth = getAuth(this.app);
  private functions = getFunctions();
  private storage = getStorage(this.app);
  private firestore = getFirestore(this.app);

  // BehaviorSubject to hold and emit the current user state
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser: Observable<User | null> = this.currentUserSubject.asObservable();
  

  constructor() {
    // Listen to authentication state changes
    console.log("This is the current user as we build the service:" + this.auth.currentUser);
    this.currentUserSubject.next(this.auth.currentUser);

    onAuthStateChanged(this.auth, (user) => {
      console.log("The user value has now changed. This is the new current user:" + this.auth.currentUser?.email);
      this.currentUserSubject.next(user); // Update the BehaviorSubject with the new user
    });
  }

 //AUTHORIZATION FUNCTIONS
 login(email: string, password: string){
   return signInWithEmailAndPassword(this.auth, email, password);
 }

 logout() {
   return signOut(this.auth);
 }

 //Returns the status of being logged in. True if there is some user logged in. False if there's no user logged in
  public isLoggedIn$(): Observable<boolean> {
    return this.currentUser.pipe(map(user => !!user));
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

 //DATBASE FUNCTIONS
  async addOrganization(organization: Organization): Promise<any> {
    console.log(JSON.stringify(organization));
    const addOrganizationFn = httpsCallable(this.functions, 'addOrganization');
    return from(addOrganizationFn(organization));
  }

  async createPost(post: Post, email: string){
    const postWithEmail = { ...post, email };
    console.log("This is the post that is passed into the service." + JSON.stringify(postWithEmail));
    const createPostFn = httpsCallable(this.functions, 'createPost');
    await createPostFn(post);
    return;
  }


  async getOrganizationByEmail(data: any): Promise<any>{
    const getOrganizationByEmailFn = httpsCallable(this.functions, 'getOrganizationByEmail');
    
    try {
      const response = await getOrganizationByEmailFn(data);
      // Use type assertion to specify the type of response.data
      const returnObj = response.data as Organization;
      return returnObj;
    } catch (error) {
      console.error("Error fetching organization by email:", error);
      throw error;
    }
  }

  //This is the only function that access the firebase storage directly
  async uploadImages(files: File[]): Promise<string[]> {
    try{
      const uploadPromises = files.map(file => {
        const filePath = `posts/${Date.now()}_${file.name}`;
        const fileRef = ref(this.storage, filePath);
        const uploadTask = uploadBytesResumable(fileRef, file);
  
        return new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed',
            null,
            error => reject(error),
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      });
      
      console.log("We are at the end of upload images")
      return Promise.all(uploadPromises);
    }catch(error){
      console.log("Error uploading images to firebase storage: " + error)
      return [];
    }
    
  }

  async getFilteredPosts(filters: any): Promise<[]>{
    const getFilteredPostsFn = httpsCallable(this.functions, 'getFilteredPosts');
    let returnVal = await getFilteredPostsFn(filters);
   console.log("This is the return value in the firebase function" + JSON.stringify(returnVal.data));
    return returnVal.data as [];
  }

  async getAllPosts(): Promise<[]>{
    const getAllPostsFn = httpsCallable(this.functions, 'getAllPosts');
    let returnVal = await getAllPostsFn();
    return returnVal.data as [];
  }

  createOrganizationRef(organizationEmail: string): DocumentReference<any>{
    return doc(this.firestore, 'organizations/' + organizationEmail);
  }
 
}

  
