import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase only if the config is not the dummy one
const isConfigured = firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY_HERE";

let app;
let auth;
let db;
let googleProvider;

if (isConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig as any) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
}

export { app, auth, db, googleProvider, isConfigured };

export const signInWithGoogle = async () => {
  if (!isConfigured) {
    alert("Firebase is not configured yet. Please update firebase-applet-config.json");
    return;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  if (!isConfigured) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
