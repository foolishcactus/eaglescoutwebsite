//USING MODULAR FIREBASE SDKS, SO YOU MUST IMPORT ALL NEEDED IMPORTS

import { Injectable } from '@angular/core';
import { Observable, from, map, BehaviorSubject} from 'rxjs';

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, User, signOut, onAuthStateChanged } from 'firebase/auth';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getFirestore, addDoc, collection, getDocs, DocumentReference, getDoc } from 'firebase/firestore';

import { Organization } from './organization';
import { Post } from './post';


@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  private app: FirebaseApp = initializeApp({
    apiKey: "AIzaSyC3yk4qTGPIaDqZ8CYVnNCkaQI3EEkmlXg",
    authDomain: "eaglescoutwebsite.firebaseapp.com",
    projectId: "eaglescoutwebsite",
    storageBucket: "eaglescoutwebsite.appspot.com",
    messagingSenderId: "337165863245",
    appId: "1:337165863245:web:747ea9574211913cb7cf04",
    measurementId: "G-ZPXTERDPQL"
  });

  private auth = getAuth(this.app);
  private functions = getFunctions(this.app);
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
  addOrganization(organization: Organization): Observable<any> {
    console.log(JSON.stringify(organization));
    const addOrganizationFn = httpsCallable(this.functions, 'addOrganization');
    return from(addOrganizationFn(organization));
  }

  async getOrganizationByEmail(email: string): Promise<any> {
    const getOrg = httpsCallable(this.functions, 'getOrganizationByEmail');
    try {
      const result = await getOrg({ email });
      return result.data; // Assuming the cloud function returns the data in a property called 'data'
    } catch (error) {
      console.error('Error fetching organization data:', error);
      throw error;
    }
  }

  async uploadImages(files: File[]): Promise<string[]> {
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
  }

  async createPost(post: Post): Promise<void> {
    console.log("We are at the beginning of upload images")
    try {
      const docRef = await addDoc(collection(this.firestore, 'posts'), post);
      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }

    console.log("We are at the end of upload images")
  }

  async getPostsWithOrganizations(): Promise<Post[]> {
    // Ensure the user is authenticated and initialized
    const isLoggedIn = this.auth.currentUser;
    console.log("We are now getting the posts with organizations function.")
    if (!isLoggedIn) {
      throw new Error('User not authenticated');
    }

    const postsCollection = collection(this.firestore, 'posts');
    const postsSnapshot = await getDocs(postsCollection);
    const posts: Post[] = [];

    for (const postDoc of postsSnapshot.docs) {
      const postData = postDoc.data() as Post;
      const organizationRef = postData.organizationRef as DocumentReference<Organization>;

      if (organizationRef) {
        try {
          // Fetch the associated organization
          const organizationDoc = await getDoc(organizationRef);
          if (organizationDoc.exists()) {
            const organizationData = organizationDoc.data() as Organization;

            //Transforming Images array into an array of objects that have a property of urlProperty with the originial string to fit the constraints of PRIME NG galleria template
            const transformedImages = postData.images.map(url => ({ urlProperty: url }));

            // Add the organization to the post data
            const post: Post = {
              ...postData,
              organization: organizationData,
              images: transformedImages,
            };
            
            posts.push(post);
          } else {
            console.error(`Organization document does not exist for post: ${postDoc.id}`);
          }
        } catch (error) {
          console.error(`Error fetching organization for post: ${postDoc.id}`, error);
        }
      } else {
        console.error(`No organizationRef for post: ${postDoc.id}`);
      }
    }

    return posts;
  }

  createOrganizationRef(organizationEmail: string): DocumentReference<any>{
    return doc(this.firestore, 'organizations/' + organizationEmail);
  }
 
}

  
