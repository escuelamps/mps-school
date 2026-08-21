import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28",
  authDomain: "mps-school-bf7ed.firebaseapp.com",
  projectId: "mps-school-bf7ed",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

async function checkAdmins() {
  try {
    const adminsRef = collection(db, 'admins');
    const snap = await getDocs(adminsRef);
    console.log("Total admins:", snap.size);
    snap.forEach(doc => {
      console.log(doc.id, "=>", doc.data());
    });
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
checkAdmins();
