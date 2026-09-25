import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, initializeFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28",
  authDomain: "mps-school-bf7ed.firebaseapp.com",
  projectId: "mps-school-bf7ed",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

async function run() {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', 'in', ['william@escuelamps.com', 'juanse@escuelamps.com']));
  const snap = await getDocs(q);
  
  for (const userDoc of snap.docs) {
    await updateDoc(doc(db, 'users', userDoc.id), { role: 'admin' });
    console.log(`Updated ${userDoc.data().email} to admin`);
  }
  process.exit(0);
}
run();
