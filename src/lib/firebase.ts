
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjWwzFpdk3bvK6WGnUhUAzUYXMFLCkbWo",
  authDomain: "skillupconnect-f6fd3.firebaseapp.com",
  projectId: "skillupconnect-f6fd3",
  storageBucket: "skillupconnect-f6fd3.firebasestorage.app",
  messagingSenderId: "33460546477",
  appId: "1:33460546477:web:9a805f1db63e0d08f58f24",
  measurementId: "G-VDLM5QS5G3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
