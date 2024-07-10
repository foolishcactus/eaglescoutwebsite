/* eslint-disable */
//firebase deploy --only functions

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {createClient} from "@usewaypoint/client";
import {Organization} from "../../src/app/organization";
//import {Post} from "../../src/app/post";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();
const client = createClient("667f5d604d0f8a0d83eed62c", "bjgEkzCaeuTzPQJHYZt9wnTY");

exports.addOrganization = functions.https.onCall(async (data: Organization) => {
  
    const organization = {
      name: data.name,
      street: data.street,
      zipcode: data.zipcode,
      state: data.state,
      city: data.city,
      email: data.email,
      description: data.description,
      isVerified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
  
    try {
      // Write to Firestore
      await admin.firestore().collection('organizations').doc(organization.email).set(organization);
      return { id: organization.email };
    } catch (error: any) {
      console.error('Error adding organization:', error);
      throw new functions.https.HttpsError('internal', `Unable to add organization: ${error.message}`, {
        details: error
      });
    }
});

exports.verifyOrganization = functions.firestore.document('organizations/{email}').onUpdate(async (change, context) => {
  const newValue = change.after.data();
  const previousValue = change.before.data();

  // Only trigger if isVerified changes from false to true
  if (previousValue.isVerified === false && newValue.isVerified === true) {
      console.log('Organization verified:', newValue.email);

      try {
          // Create a user account with Firebase Authentication
          const userRecord = await admin.auth().createUser({
              email: newValue.email,
              emailVerified: false,
              password: 'temporaryPassword123', // Set a temporary password
              displayName: newValue.organizationname,
              disabled: false,
          });

          console.log('User created successfully:', userRecord.uid);

          // Generate password reset link
          const resetLink = await admin.auth().generatePasswordResetLink(newValue.email);

          console.log('Password reset link generated:', resetLink);

          // Send the reset link email using Waypoint template

          await client.emailMessages.createTemplated({
            templateId: "wptemplate_XqtPZL5jFbMg7ZzY",
            to: newValue.email,
            variables: {
              url: resetLink,
            },
          });

          console.log('Password reset email sent successfully to:', newValue.email);

      } catch (error) {
          console.error('Error creating user or sending password reset email:', error);
      }
  }
});

exports.getOrganizationByEmail = functions.https.onCall(async (data, context) => {
  console.log("This is the log to see if the function even fired")

  console.log("Hello this is the data we are being passed" + JSON.stringify(data));
  const email = data.email;
  console.log("This is the email we are searching for" + data.email)

  if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with an email.');
  }

  try {
      const organizationDoc = await admin.firestore().collection('organizations').doc(email).get();

      if (!organizationDoc.exists) {
          throw new functions.https.HttpsError('not-found', `No organization found with email: ${email}`);
      }

      
      return { organization: organizationDoc.data() };
  } catch (error:any) {
      console.error('Error retrieving organization:', error);
      throw new functions.https.HttpsError('internal', 'Unable to retrieve organization data', { details: error.message });
  }
});

exports.createPost = functions.https.onCall(async (data, context) => {
  const { title, description, category, userId, images } = data;

  //Uploading images to Firebase Storage
  const imageUrls = await Promise.all(images.map(async (image: string, index: number) => {
    const buffer = Buffer.from(image, 'base64');
    const filePath = `posts/${Date.now()}_${index}.jpg`;
    const file = bucket.file(filePath);
    await file.save(buffer, { contentType: 'image/jpeg' });
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' });
    return url;
  }));

  const post = {
    title,
    description,
    category,
    userId,
    images: imageUrls,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('posts').add(post);

  return { success: true, post };
});
