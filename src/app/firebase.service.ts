//USING MODULAR FIREBASE SDKS, SO YOU MUST IMPORT ALL NEEDED IMPORTS

import { Injectable } from '@angular/core';
import { Observable, from, map, BehaviorSubject } from 'rxjs';

import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  User,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { httpsCallable, getFunctions } from 'firebase/functions';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getBlob,
} from 'firebase/storage';

import { Organization } from './organization';
import { Post } from './post';
import firebaseConfig from '../app/firebase-config.json';
import { FunctionReturnPacket } from './function-return-packet';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app: FirebaseApp = initializeApp(firebaseConfig);
  private auth = getAuth(this.app);
  private functions = getFunctions();
  private storage = getStorage(this.app);

  // BehaviorSubject to hold and emit the current user state
  private currentUserSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  public currentUser: Observable<User | null> =
    this.currentUserSubject.asObservable();

  constructor() {
    // Listen to authentication state changes
    console.log(
      'This is the current user as we build the service:' +
        this.auth.currentUser,
    );
    this.currentUserSubject.next(this.auth.currentUser);

    onAuthStateChanged(this.auth, (user) => {
      console.log(
        'The user value has now changed. This is the new current user:' +
          this.auth.currentUser?.email,
      );
      this.currentUserSubject.next(user); // Update the BehaviorSubject with the new user
    });
  }

  //AUTHORIZATION FUNCTIONS
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  //Returns the status of being logged in. True if there is some user logged in. False if there's no user logged in
  public isLoggedIn$(): Observable<boolean> {
    return this.currentUser.pipe(map((user) => !!user));
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  //RealTime Database Functions
  async uploadImages(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) => {
        const filePath = `posts/${Date.now()}_${file.name}`;
        const fileRef = ref(this.storage, filePath);
        const uploadTask = uploadBytesResumable(fileRef, file);

        return new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => reject(error),
            async () => {
              try {
                const downloadURL = await getDownloadURL(
                  uploadTask.snapshot.ref,
                );
                resolve(downloadURL);
              } catch (error) {
                reject(error);
              }
            },
          );
        });
      });

      console.log('We are at the end of upload images');
      return Promise.all(uploadPromises);
    } catch (error) {
      console.log('Error uploading images to firebase storage: ' + error);
      return [];
    }
  }

  async deleteImageWithURL(imageURL: string) {
    const imageRef = ref(
      this.storage,
      this.convertFirebaseUrlToStorageUrl(imageURL),
    );
    deleteObject(imageRef)
      .then(() => {
        console.log('Image deleted successfully.');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async urlToFile(url: string): Promise<File> {
    console.log('This is the urlbeing passed in' + url);
    const storageRef = ref(
      this.storage,
      this.convertFirebaseUrlToStorageUrl(url),
    );
    const blob = await getBlob(storageRef);

    return this.blobToFile(blob, this.generateRandomString());
  }

  blobToFile(theBlob: Blob, fileName: string): File {
    return new File([theBlob], fileName, {
      type: theBlob.type,
      lastModified: Date.now(),
    });
  }

  convertFirebaseUrlToStorageUrl(url: string): string {
    // Decode the URL to handle encoded characters
    const decodedUrl = decodeURIComponent(url);

    // Find the position of 'posts/' in the URL
    const prefix = 'posts/';
    const startIndex = decodedUrl.indexOf(prefix);
    if (startIndex === -1) {
      throw new Error('Prefix not found in the URL');
    }

    // Find the position of '?' which indicates the end of the file name
    const endIndex = decodedUrl.indexOf('?', startIndex);
    if (endIndex === -1) {
      throw new Error('Query parameters not found in the URL');
    }

    // Extract the file name
    const fileName = decodedUrl.substring(startIndex + prefix.length, endIndex);

    // Generate the new URL
    const baseBucketUrl = 'gs://eaglescoutwebsite.appspot.com/posts';
    return `${baseBucketUrl}/${fileName}`;
  }

  generateRandomString(length: number = 4): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  //Cloud FireStore Write Functions
  async addOrganization(organization: Organization): Promise<any> {
    const addOrganizationFn = httpsCallable(this.functions, 'addOrganization');

    //the return value is either true if successful or false if unsuccessful
    const returnVal = await addOrganizationFn(organization);
    const functionReturnPacket: FunctionReturnPacket =
      returnVal.data as FunctionReturnPacket;

    console.log(functionReturnPacket.message);
    return functionReturnPacket.wasSuccess;
  }

  async createOrEditPost(
    post: Post,
    email: string,
    inEditMode?: boolean,
    oldTitleForIdentificationInEditMode?: string,
  ) {
    let returnVal;

    if (inEditMode) {
      const editPostFn = httpsCallable(this.functions, 'editPost');
      console.log('We are in edit mode and about to call the edit function');
      const dataPacket = {
        ...post,
        email,
        oldTitleForIdentificationInEditMode,
      };
      console.log(
        'Here is the data packet we are passing through' +
          JSON.stringify(dataPacket),
      );
      returnVal = await editPostFn(dataPacket);
    } else {
      const createPostFn = httpsCallable(this.functions, 'createPost');
      const dataPacket = { ...post, email };
      returnVal = await createPostFn(dataPacket);
    }

    const functionReturnPacket: FunctionReturnPacket =
      returnVal.data as FunctionReturnPacket;
    console.log(functionReturnPacket.message);
    return functionReturnPacket;
  }

  async deletePost(post: Post) {
    const deletePostFn = httpsCallable(this.functions, 'deletePost');
    const returnVal = await deletePostFn(post);

    const functionReturnPacket: FunctionReturnPacket =
      returnVal.data as FunctionReturnPacket;
    console.log(functionReturnPacket.message);
    return functionReturnPacket.wasSuccess;
  }

  //Cloud FireStore Read Functions

  async getPostsWithPagination(
    limit: number,
    startAfter?: string,
    filterCriteria?: any,
  ) {
    const getPostsWithPagination = httpsCallable(
      this.functions,
      'getPostsWithPagination',
    );
    const dataPacket = {
      limit: limit,
      startAfter: startAfter,
      filterCriteria: filterCriteria,
    };
    const returnVal = await getPostsWithPagination(dataPacket);
    const functionReturnPacket: FunctionReturnPacket =
      returnVal.data as FunctionReturnPacket;
    console.log(functionReturnPacket.message);
    console.log(
      'This is the value of the data we received from firebase ' +
        JSON.stringify(functionReturnPacket.data),
    );
    return functionReturnPacket.data;
  }

  async getOrganizationByEmail(data: any): Promise<any> {
    const getOrganizationByEmailFn = httpsCallable(
      this.functions,
      'getOrganizationByEmail',
    );
    const returnVal = await getOrganizationByEmailFn(data);
    // Use type assertion to specify the type of response.data
    const functionReturnPacket: FunctionReturnPacket =
      returnVal.data as FunctionReturnPacket;

    console.log(functionReturnPacket.message);
    return functionReturnPacket.data;
  }

  async getFilteredPosts(filters: any): Promise<[]> {
    const getFilteredPostsFn = httpsCallable(
      this.functions,
      'getFilteredPosts',
    );
    let returnVal = await getFilteredPostsFn(filters);

    let functionReturnPacket: FunctionReturnPacket =
      returnVal.data as FunctionReturnPacket;
    console.log(functionReturnPacket.message);
    return functionReturnPacket.data as [];
  }

  async getAllPosts(): Promise<[]> {
    const getAllPostsFn = httpsCallable(this.functions, 'getAllPosts');
    let returnVal = await getAllPostsFn();

    let functionReturnPacket: FunctionReturnPacket =
      returnVal.data as FunctionReturnPacket;

    if (functionReturnPacket.wasSuccess) {
      console.log(functionReturnPacket.message);
      return functionReturnPacket.data as [];
    } else {
      throw new Error(functionReturnPacket.message);
    }
  }

  async getPostsFromOrganization(data: any) {
    const getPostsFromOrganizationFn = httpsCallable(
      this.functions,
      'getPostsFromOrganization',
    );
    let returnVal = await getPostsFromOrganizationFn(data);
    let functionReturnPacket: FunctionReturnPacket =
      returnVal.data as FunctionReturnPacket;
    console.log(functionReturnPacket.message);
    return functionReturnPacket.data as [];
  }
}
