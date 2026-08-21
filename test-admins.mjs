import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28",
  authDomain: "mps-school-bf7ed.firebaseapp.com",
  projectId: "mps-school-bf7ed",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

async function insertAdmins() {
  try {
    const adminsRef = collection(db, 'admins');
    await addDoc(adminsRef, { username: "lpineda", password: "escuelamps2026*" });
    await addDoc(adminsRef, { username: "william", password: "william2026*" });
    console.log("Administrators added successfully to Firestore!");
  } catch (e) {
    console.error("Error:", e);
  }
}
insertAdmins();
