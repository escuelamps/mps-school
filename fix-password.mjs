import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28",
  authDomain: "mps-school-bf7ed.firebaseapp.com",
  projectId: "mps-school-bf7ed",
  storageBucket: "mps-school-bf7ed.firebasestorage.app",
  messagingSenderId: "742759520223",
  appId: "1:742759520223:web:acf20e11de1a1e21de966a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function run() {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'lpineda@escuelamps.com', 'password123');
    await updatePassword(userCredential.user, 'escuelamps2026*');
    console.log("Contraseña de lpineda actualizada a escuelamps2026*");
  } catch(e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
