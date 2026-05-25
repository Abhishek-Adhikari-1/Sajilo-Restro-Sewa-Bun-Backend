import admin from "firebase-admin";
import { env } from "./env";

const serviceAccount = {
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  privateKey: env.FIREBASE_PRIVATE_KEY,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

admin.firestore().settings({
  databaseId: "default",
});

export const db = admin.firestore();
