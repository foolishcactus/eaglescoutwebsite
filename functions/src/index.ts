/* eslint-disable */
//firebase deploy --only functions
import { initializeApp } from 'firebase-admin/app';
import { logger } from 'firebase-functions';
//import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';

// Initialize Firebase Admin SDK

//var serviceAccount = require("C:/Users/egumu/Documents/eaglescoutwebsite-firebase-adminsdk-k5rmp-d8e05ddb7c.json");
initializeApp();
const db = getFirestore();
//{ cors: 'http://localhost:4200' }

//READ FUNCTIONS
export const getAllPosts = onCall(async (request) => {
  try {
    const postsRef = db.collection('posts');

    logger.log('We are now beginning the query to get all posts');

    // Execute the query to get all documents in the 'posts' collection
    const snapshot = await postsRef.get();

    logger.log(
      'This is the snapshot from the query ' + JSON.stringify(snapshot),
    );
    logger.log('Also the unstringified version: ' + snapshot);

    const allPosts: any[] = [];

    // Process each document in the snapshot
    for (const doc of snapshot.docs) {
      const postData = doc.data();
      const organizationRef = postData.organizationRef;

      // Fetch the organization data using the reference
      const organizationDoc = await organizationRef.get();
      const organizationData = organizationDoc.data();

      // Add the organization data to the post
      allPosts.push({
        id: doc.id,
        ...postData,
        organizationRef: null,
        organization: organizationData,
      });
    }

    logger.log(
      'This is the all posts with organizations: ' + JSON.stringify(allPosts),
    );
    let returnObj = {
      wasSuccess: true,
      message: 'We successfully got all posts.',
      data: allPosts,
    };
    logger.log(
      'This is the returnObj that we are sending out of the cloud function ',
    );
    logger.log(returnObj);
    return returnObj;
  } catch (error: any) {
    logger.log(
      'We ran into an error when getting all posts in the cloud function: ' +
        JSON.stringify(error),
    );
    return error.message;
  }
});

export const getFilteredPosts = onCall(async (request) => {
  try {
    // One degree of latitude is approximately 69 miles
    const latShift = request.data.radius / 69.0;

    // One degree of longitude varies based on the latitude
    const longShift =
      request.data.radius /
      (69.0 * Math.cos((request.data.lat * Math.PI) / 180));

    const latMin = request.data.lat - latShift;
    const latMax = request.data.lat + latShift;
    const longMin = request.data.long - longShift;
    const longMax = request.data.long + longShift;

    logger.log('This is latmin: ' + latMin);
    logger.log('This is latMax: ' + latMax);
    logger.log('This is longMin: ' + longMin);
    logger.log('This is longMax: ' + longMax);

    const postsRef = db.collection('posts');

    logger.log('We are now beginning the query');
    logger.log(
      'This is the categories data: ' + JSON.stringify(request.data.category),
    );
    logger.log(
      'This is whether we have more than 1 category query' +
        JSON.stringify(request.data.category.length),
    );

    let query = postsRef
      .where('lat', '>=', latMin)
      .where('lat', '<=', latMax)
      .where('long', '>=', longMin)
      .where('long', '<=', longMax);

    if (request.data.category && request.data.category.length > 0) {
      logger.log('We have category queries');
      const categoryNames = request.data.category.map(
        (category: { name: string }) => category.name,
      );
      logger.log('This is the categoryNames ' + JSON.stringify(categoryNames));
      query = query.where('category', 'in', categoryNames);
    }

    const snapshot = await query.get();

    logger.log(
      'This is the snapshot from the query ' + JSON.stringify(snapshot),
    );
    logger.log('Also the unstringified version: ' + snapshot);

    const filteredPosts: any[] = [];

    for (const doc of snapshot.docs) {
      const postData = doc.data();
      const organizationRef = postData.organizationRef;

      // Fetch the organization data using the reference
      const organizationDoc = await organizationRef.get();
      const organizationData = organizationDoc.data();

      // Add the organization data to the post
      filteredPosts.push({
        id: doc.id,
        ...postData,
        organizationRef: null,
        organization: organizationData,
      });
    }

    logger.log('This is the filtered posts' + JSON.stringify(filteredPosts));
    return {
      wasSuccess: true,
      message: 'Successfully filtered posts.',
      data: filteredPosts as [],
    };
  } catch (error: any) {
    logger.log(
      'We ran into an error when getting filtered posts in the cloud function: ' +
        JSON.stringify(error),
    );
    return { wasSuccess: false, message: 'Error when trying to filter posts' };
  }
});

export const getOrganizationByEmail = onCall(async (request) => {
  try {
    const email = request.data.email;
    logger.log('This is the email we are passing index.ts: ' + email);
    console.log('This is the email we are passing index.ts: ' + email);

    if (!email) {
      logger.log('Something wrong with the email passed');
      return;
    }

    const doc = await db.collection('organizations').doc(email).get();

    if (!doc.exists) {
      logger.log('No document existis');
    }
    logger.log('This is the doc.data' + JSON.stringify(doc.data()));
    return {
      wasSuccess: true,
      message: 'Successfully found an organization with email.',
      data: doc.data(),
    };
  } catch (error: any) {
    logger.log(
      'We ran into an error when adding organization in the cloud function: ' +
        JSON.stringify(error),
    );
    return {
      wasSuccess: false,
      message: "Couldn't find organization with email.",
    };
  }
});

export const getPostsFromOrganization = onCall(async (request) => {
  try {
    const orgRef = db.collection('organizations').doc(request.data.email);
    const orgDoc = await orgRef.get();

    const postsQuery = db
      .collection('posts')
      .where('organizationRef', '==', orgRef);
    const snapshot = await postsQuery.get();

    const posts: any[] = [];

    snapshot.forEach((doc) => {
      posts.push({
        ...doc.data(),
        organizationRef: null,
        organization: orgDoc.data(),
      });
    });

    logger.log(
      'This is the posts from the organization in the cloud function' +
        JSON.stringify(posts),
    );
    return {
      wasSuccess: true,
      message: 'Found posts from organization.',
      data: posts as [],
    };
  } catch (e: any) {
    logger.log(
      'We ran into an error when getting all posts from an Organization',
    );
    return {
      wasSuccess: false,
      message: "Couldn't find posts from organization",
    };
  }
});

//WRITE FUNCTIONS
export const addOrganization = onCall(async (request) => {
  try {
    //request.data is equal to the Organization object we are passing

    //Check to see a document associated with this organization exists already
    let doc = await db
      .collection('organizations')
      .doc(request.data.email)
      .get();
    if (doc.exists) {
      return {
        wasSuccess: false,
        message: 'There is an email already associated with this account.',
      };
    }

    const organization = {
      name: request.data.name,
      street: request.data.street,
      zipcode: request.data.zipcode,
      state: request.data.state,
      city: request.data.city,
      email: request.data.email,
      description: request.data.description,
      isVerified: false,
      createdAt: FieldValue.serverTimestamp(),
    };

    await db
      .collection('organizations')
      .doc(request.data.email)
      .set(organization);
    logger.log('Organization added.');
    return { wasSuccess: true, message: 'Form Successfully Submitted' };
  } catch (error) {
    logger.log(
      'We ran into an error when adding organization in the cloud function: ' +
        JSON.stringify(error),
    );
    return {
      wasSuccess: false,
      message: 'There was an error submitting your form.',
    };
  }
});

export const createPost = onCall(async (request) => {
  try {
    //request.data is equal to the object we are passing
    //Object structure that gets passed: {"title":"Firepit","description":"We need help building a firepit","category":"Construction","images":["https://firebasestorage.googleapis.com/v0/b/eaglescoutwebsite.appspot.com/o/posts%2F1720800032575_TopPOV%20Blueprint.PNG?alt=media&token=50f36b9e-6993-4e3d-aabe-b7cd1c031cc7"],"createdAt":"2024-07-12T16:00:33.496Z","email":"strikerchannele@gmail.com"}
    const organizationRef = db
      .collection('organizations')
      .doc(request.data.email);
    const organizationDoc = await organizationRef.get();

    if (!organizationDoc.exists) {
      throw new Error('Organization not found');
    }

    const organizationData = organizationDoc.data();

    if (!organizationData) {
      throw new Error('Organization data was undefined');
    }

    if (organizationData.numOfActivePosts >= 3) {
      return {
        wasSuccess: false,
        message: 'Too many active posts. The max is 3. Delete a post.',
      };
    }

    //Checking if the post snapshot query is not empty. If it is not empty then there is another document with that title
    const postCheck = await db
      .collection('posts')
      .where('title', '==', request.data.title)
      .get();
    if (!postCheck.empty) {
      return {
        wasSuccess: false,
        message: 'Post with this title already exists.',
      };
    }

    const post = {
      title: request.data.title,
      description: request.data.description,
      category: request.data.category,
      organizationRef: organizationRef,
      images: request.data.images,
      createdAt: FieldValue.serverTimestamp(),
      lat: organizationData.lat,
      long: organizationData.long,
    };
    await db.collection('posts').add(post);

    // Update the organization document to increment numOfActivePosts by 1
    await organizationRef.update({
      numOfActivePosts: FieldValue.increment(1),
    });

    return { wasSuccess: true, message: 'Post successfully created' };
  } catch (error: any) {
    logger.log(
      'We ran into an error when creating a post in the cloud function: ' +
        JSON.stringify(error),
    );
    return {
      wasSuccess: false,
      message: "Unknown error couldn't add your post.",
    };
  }
});

export const editPost = onCall(async (request) => {
  try {
    // Query for the document to update
    const querySnapshot = await db
      .collection('posts')
      .where('title', '==', request.data.oldTitleForIdentificationInEditMode)
      .get();

    if (querySnapshot.empty) {
      return { wasSuccess: false, message: "Couldn't find post" };
    }

    // Assume there's only one document with the specified title
    const docRef = querySnapshot.docs[0].ref;

    // Update the document with new data
    await docRef.update({
      title: request.data.title,
      description: request.data.description,
      category: request.data.category,
      images: request.data.images,
    });

    return { wasSuccess: true, message: 'Post successfully edited' };
  } catch (e) {
    return { wasSuccess: false, message: "Couldn't edit post" };
  }
});

export const deletePost = onCall(async (request) => {
  try {
    const postsRef = db.collection('posts');
    const querySnapshot = await postsRef
      .where('title', '==', request.data.title)
      .get();

    if (querySnapshot.empty) {
      return { wasSuccess: false, message: 'No matching documents found.' };
    }

    const doc = querySnapshot.docs[0];
    const organizationRef = doc.data().organizationRef;

    // Delete the post document
    await doc.ref.delete();

    // Decrement the numOfActivePosts in the organization document
    await organizationRef.update({
      numOfActivePosts: FieldValue.increment(-1),
    });

    return { wasSuccess: true, message: 'Document successfully deleted.' };
  } catch (e) {
    logger.log(
      'We ran into an error when trying to delete a post in cloud functions: ' +
        JSON.stringify(e),
    );
    return { wasSuccess: false, message: 'Failed to delete post.' };
  }
});
