// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Add this import for Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnJK-wIZQpXgrON757AM4gwkPRRPLi17Q",
  authDomain: "dentease-app.firebaseapp.com",
  projectId: "dentease-app",
  storageBucket: "dentease-app.firebasestorage.app", // Note: This should be correct as is
  messagingSenderId: "526321098823",
  appId: "1:526321098823:web:d8d7be6454995441a09162",
  measurementId: "G-WC4LPH21NW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export the Firebase services
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Add this line to initialize and export storage