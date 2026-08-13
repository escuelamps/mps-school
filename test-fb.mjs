import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, initializeFirestore } from 'firebase/firestore';

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

async function test() {
  try {
    const chatRef = doc(db, 'whatsapp_chats', '1234567890');
    await setDoc(chatRef, {
      lastMessage: "Test msg",
      phone: "1234567890",
      botState: "MENU_PRINCIPAL"
    }, { merge: true });
    console.log("Success!");
  } catch (e) {
    console.error("Firebase Error:", e);
  }
}

test();
