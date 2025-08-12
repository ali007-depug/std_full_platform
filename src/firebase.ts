// firebase.ts
import { initializeApp } from "firebase/app";

// Only initialization is done here (tiny size)
const firebaseConfig = {
  apiKey: "AIzaSyAwKNEvi5YJVPzE2NmeWUMUWjWNsWUkQao",
  authDomain: "std-full-v.firebaseapp.com",
  projectId: "std-full-v",
  storageBucket: "std-full-v.firebasestorage.app",
  messagingSenderId: "1030073222679",
  appId: "1:1030073222679:web:3cf2ee1bbf1d80d7e2fe52",
  measurementId: "G-8RCH6751FY"
};

export const app = initializeApp(firebaseConfig);

// Functions to import heavy modules only when needed
export async function getDb() {
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(app);
}

export async function getAuthInstance() {
  const { getAuth } = await import("firebase/auth");
  return getAuth(app);
}
