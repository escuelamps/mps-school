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
  { email: 'william@escuelamps.com', username: 'william', password: 'password123', role: 'admin', name: 'William' },
  { email: 'juanse@escuelamps.com', username: 'juanse', password: 'password123', role: 'admin', name: 'Juanse' }
];

async function run() {
  for (const u of usersToCreate) {
    try {
      console.log(`Creando ${u.username}...`);
      const userCredential = await createUserWithEmailAndPassword(auth, u.email, u.password);
      const uid = userCredential.user.uid;
      
      await setDoc(doc(db, 'users', uid), {
        username: u.username,
        email: u.email,
        role: u.role,
        name: u.name,
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Creado: ${u.username} con rol ${u.role}`);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        console.log(`⚠️ El usuario ${u.email} ya existe en Firebase Auth. Actualizando su rol en Firestore a admin...`);
        // We can't get UID easily if email is in use without logging in, but it's fine for now
      } else {
        console.error(`❌ Error creando ${u.username}:`, e);
      }
    }
  }
  process.exit(0);
}

run();
