import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28",
  authDomain: "mps-school-bf7ed.firebaseapp.com",
  projectId: "mps-school-bf7ed",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function test() {
  try {
    const q = query(collection(db, 'cenas'), orderBy('createdAt', 'desc'), limit(5));
    const snap = await getDocs(q);
    snap.forEach(doc => console.log(doc.id, doc.data()));
    console.log("Total:", snap.size);
  } catch (err) {
    console.error("Firebase Error:", err.message);
  }
  process.exit(0);
}
test();
