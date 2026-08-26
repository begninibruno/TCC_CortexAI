import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

export function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Variáveis do Firebase não foram configuradas corretamente no .env.local"
    );
  }

  // Some env formats (or manual copy/paste) may include surrounding quotes
  // and literal "\n" sequences. Normalize the key so the PEM parser accepts it.
  const normalizedPrivateKey = (() => {
    let key = privateKey;
    // remove surrounding double quotes if present
    if (key.startsWith('"') && key.endsWith('"')) {
      key = key.slice(1, -1);
    }

    // replace escaped newlines with real newlines
    key = key.replace(/\\n/g, '\n');

    return key;
  })();

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: normalizedPrivateKey,
    }),
  });
}

export function getAdminAuth(): Auth {
  initializeFirebaseAdmin();

  if (!adminAuth) {
    adminAuth = getAuth();
  }

  return adminAuth;
}

export function getAdminDb(): Firestore {
  initializeFirebaseAdmin();

  if (!adminDb) {
    adminDb = getFirestore();
  }

  return adminDb;
}
