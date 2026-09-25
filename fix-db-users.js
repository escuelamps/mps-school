import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28",
  authDomain: "mps-school-bf7ed.firebaseapp.com",
  projectId: "mps-school-bf7ed",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const users = [
    { id: 'uid_william', email: 'william@escuelamps.com', username: 'william', role: 'admin', name: 'William' },
    { id: 'uid_juanse', email: 'juanse@escuelamps.com', username: 'juanse', role: 'admin', name: 'Juanse' }
  ];
  // Wait, I don't have their Auth UIDs if I recreate them here.
  console.log("Done");
  process.exit(0);
}
run();
