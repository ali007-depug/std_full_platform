// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwKNEvi5YJVPzE2NmeWUMUWjWNsWUkQao",
  authDomain: "std-full-v.firebaseapp.com",
  projectId: "std-full-v",
  storageBucket: "std-full-v.firebasestorage.app",
  messagingSenderId: "1030073222679",
  appId: "1:1030073222679:web:3cf2ee1bbf1d80d7e2fe52",
  measurementId: "G-8RCH6751FY"
};

  // Initialize Firebase

  export const app = initializeApp(firebaseConfig);

  // Export Firebase services
  export const db = getFirestore(app);
  export const auth = getAuth(app)