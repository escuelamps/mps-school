import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updatePassword, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBLbVAmpri8BRRlA98MoP-I7i4wjZslQ28",
  authDomain: "mps-school-bf7ed.firebaseapp.com",
  projectId: "mps-school-bf7ed",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function run() {
  try {
    await signInWithEmailAndPassword(auth, 'william@escuelamps.com', 'william2026*');
    await updatePassword(auth.currentUser, 'escuelaMPS2026*');
    console.log('✅ William password updated to escuelaMPS2026*');
  } catch (e) {
    console.error('Error William:', e.message);
  }

  try {
    // If Juanse exists with password123 (from task-9344) or william2026* or escuelaMPS2026*
    await signInWithEmailAndPassword(auth, 'juanse@escuelamps.com', 'william2026*')
      .catch(() => signInWithEmailAndPassword(auth, 'juanse@escuelamps.com', 'password123'))
      .catch(() => createUserWithEmailAndPassword(auth, 'juanse@escuelamps.com', 'escuelaMPS2026*'));
    
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, 'escuelaMPS2026*');
      console.log('✅ Juanse password updated to escuelaMPS2026*');
    }
  } catch(e) {
    console.error('Error Juanse:', e.message);
  }
  process.exit(0);
}
run();
