import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import firebaseConfig from '../../firebase-applet-config.json';

export const ADMIN_SESSION_STORAGE_KEY = 'jj_cbt_admin_session_v1';

// Initialize Firebase only if the config is not the dummy one
const isConfigured = firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY_HERE";

let app;
let auth;
let db;
let storage;
let googleProvider;

if (isConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig as any) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
}

export { app, auth, db, storage, googleProvider, isConfigured };

export const rememberAdminSession = () => {
  try {
    localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, '1');
  } catch (error) {
    console.warn('Could not persist admin session', error);
  }
};

export const hasRememberedAdminSession = () => {
  try {
    return localStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === '1';
  } catch (error) {
    return false;
  }
};

export const clearRememberedAdminSession = () => {
  try {
    localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn('Could not clear admin session', error);
  }
};

export const signInWithGoogle = async () => {
  if (!isConfigured) {
    alert("Firebase is not configured yet. Please update firebase-applet-config.json");
    return;
  }
  try {
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, googleProvider);
    rememberAdminSession();
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  clearRememberedAdminSession();
  if (!isConfigured) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};