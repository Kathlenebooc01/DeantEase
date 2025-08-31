// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // <-- This is the missing import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnJK-wIZQpXgrON757AM4gwkPRRPLi17Q",
  authDomain: "dentease-app.firebaseapp.com",
  projectId: "dentease-app",
  storageBucket: "dentease-app.firebasestorage.app",
  messagingSenderId: "526321098823",
  appId: "1:526321098823:web:d8d7be6454995441a09162",
  measurementId: "G-WC4LPH21NW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export the Firebase services
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app); // <-- This is the missing line
