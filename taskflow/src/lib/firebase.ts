import { initializeApp, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC4CEsIIobplv2swmV2cdPA1-oB1yZ0adw",
  authDomain: "taskflow-d9e48.firebaseapp.com",
  databaseURL: "https://taskflow-d9e48-default-rtdb.firebaseio.com/",
  projectId: "taskflow-d9e48",
  storageBucket: "taskflow-d9e48.firebasestorage.app",
  messagingSenderId: "44421031448",
  appId: "1:44421031448:web:43e7e7e534a6881682056d",
  measurementId: "G-3K0QQPRB5D"
};

// Initialize Firebase - use a singleton pattern to avoid duplicates
let app;

try {
  // Try to get existing app first to avoid duplicates during HMR
  app = getApp();
} catch (error) {
  // If no app exists, initialize a new one
  app = initializeApp(firebaseConfig, '[DEFAULT]');
}

export const auth = getAuth(app);
export const db = getDatabase(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;

export default app;
