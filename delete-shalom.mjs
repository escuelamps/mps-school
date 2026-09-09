import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

async function run() {
  const snapshot = await getDocs(collection(db, 'users'));
  let count = 0;
  snapshot.forEach((d) => {
    const data = d.data();
    if (data.name && data.name.toLowerCase().includes('shalom')) {
      deleteDoc(doc(db, 'users', d.id));
      count++;
    }
  });
  console.log(`Se eliminaron ${count} registros de Shalom.`);
  process.exit(0);
}
run();
