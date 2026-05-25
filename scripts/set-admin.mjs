/**
 * set-admin.mjs
 * Sets isAdmin: true on usuario1@test.com in Firestore for testing.
 * Run with: node scripts/set-admin.mjs
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBlmrNkJQZK-SGUkpFIoNIC2WNBjowQbmA',
  authDomain: 'sala-de-juegos-e1527.firebaseapp.com',
  projectId: 'sala-de-juegos-e1527',
  storageBucket: 'sala-de-juegos-e1527.firebasestorage.app',
  messagingSenderId: '604083991995',
  appId: '1:604083991995:web:a6b1a18c3483917a9c009e',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  console.log('→ Signing in as usuario1@test.com...');
  const cred = await signInWithEmailAndPassword(auth, 'usuario1@test.com', '123456');
  const uid = cred.user.uid;
  console.log(`  UID: ${uid}`);

  // Merge isAdmin: true into the existing user document
  await setDoc(doc(db, 'usuarios', uid), { isAdmin: true }, { merge: true });
  console.log('  ✓ isAdmin: true set on usuario1');

  // Verify
  const snap = await getDoc(doc(db, 'usuarios', uid));
  console.log('  Firestore data:', snap.data());

  await signOut(auth);
  console.log('\nDone.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
