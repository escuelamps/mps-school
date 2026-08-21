import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28",
  authDomain: "mps-school-bf7ed.firebaseapp.com",
  projectId: "mps-school-bf7ed",
  storageBucket: "mps-school-bf7ed.firebasestorage.app",
  messagingSenderId: "742759520223",
  appId: "1:742759520223:web:acf20e11de1a1e21de966a",
  measurementId: "G-3GBQL0BZG1"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Analytics only on the client side
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

const db = initializeFirestore(app, { experimentalForceLongPolling: true });
const storage = getStorage(app);

export { app, auth, db, storage, analytics };
