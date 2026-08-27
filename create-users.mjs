import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, initializeFirestore } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28",
  authDomain: "mps-school-bf7ed.firebaseapp.com",
  projectId: "mps-school-bf7ed",
  storageBucket: "mps-school-bf7ed.firebasestorage.app",
  messagingSenderId: "742759520223",
  appId: "1:742759520223:web:acf20e11de1a1e21de966a",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });
const auth = getAuth(app);

const usersToCreate = [
  { email: 'lpineda@escuelamps.com', username: 'lpineda', password: 'password123', role: 'admin' },
  { email: 'profe-test@escuelamps.com', username: 'profe-test', password: 'password123', role: 'teacher' },
  { email: 'alumno-test@escuelamps.com', username: 'alumno-test', password: 'password123', role: 'student' }
];

async function run() {
  for (const u of usersToCreate) {
    try {
      console.log(`Creando ${u.username}...`);
      const userCredential = await createUserWithEmailAndPassword(auth, u.email, u.password);
      const uid = userCredential.user.uid;
      
      // Guardar el rol en Firestore
      await setDoc(doc(db, 'users', uid), {
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Creado: ${u.username} con rol ${u.role}`);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        console.log(`⚠️ El usuario ${u.email} ya existe en Firebase Auth.`);
      } else {
        console.error(`❌ Error creando ${u.username}:`, e);
      }
    }
  }
  process.exit(0);
}

run();
