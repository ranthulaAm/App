import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC6fNMDIhcs0lqfvM3Nq57GIUwrXAuUlbk",
  authDomain: "ragraphics-app.firebaseapp.com",
  projectId: "ragraphics-app",
  storageBucket: "ragraphics-app.firebasestorage.app",
  messagingSenderId: "1091662698201",
  appId: "1:1091662698201:web:f7ea1241395e78834b90c8",
  measurementId: "G-D0B08B4R56"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);