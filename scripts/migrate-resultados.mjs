/**
 * migrate-resultados.mjs
 * Migrates old per-game result collections into a single `resultados` collection
 * with a `juego` discriminator field.
 *
 * Old collections:
 *   resultados_ahorcado    → juego: 'ahorcado'
 *   resultados_mayor_menor → juego: 'mayor-menor'
 *   resultados_preguntados → juego: 'preguntados'
 *   resultados_generala    → juego: 'generala'
 *
 * Run with: node scripts/migrate-resultados.mjs
 * Use --dry-run to preview without writing.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  Timestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBlmrNkJQZK-SGUkpFIoNIC2WNBjowQbmA',
  authDomain: 'sala-de-juegos-e1527.firebaseapp.com',
  projectId: 'sala-de-juegos-e1527',
  storageBucket: 'sala-de-juegos-e1527.firebasestorage.app',
  messagingSenderId: '604083991995',
  appId: '1:604083991995:web:a6b1a18c3483917a9c009e',
};

const DRY_RUN = process.argv.includes('--dry-run');

const OLD_COLLECTIONS = [
  { name: 'resultados_ahorcado', juego: 'ahorcado' },
  { name: 'resultados_mayor_menor', juego: 'mayor-menor' },
  { name: 'resultados_preguntados', juego: 'preguntados' },
  { name: 'resultados_generala', juego: 'generala' },
];

const TARGET_COLLECTION = 'resultados';

const app = initializeApp(firebaseConfig, 'migrate');
const auth = getAuth(app);
const db = getFirestore(app);

async function migrateCollection({ name, juego }) {
  console.log(`\n📂 Leyendo colección "${name}"...`);

  const snap = await getDocs(collection(db, name));
  const totalDocs = snap.size;
  console.log(`   ${totalDocs} documento(s) encontrado(s).`);

  if (totalDocs === 0) return { total: 0, migrated: 0, errors: 0 };

  let migrated = 0;
  let errors = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const docId = docSnap.id;

    const newDoc = {
      ...data,
      juego,
      createdAt: data.createdAt ?? Timestamp.now(),
    };

    delete newDoc.id;

    if (DRY_RUN) {
      console.log(`   [DRY-RUN] → ${TARGET_COLLECTION}/${docId} (juego: ${juego})`);
    } else {
      try {
        await setDoc(doc(db, TARGET_COLLECTION, docId), newDoc);
        migrated++;
      } catch (err) {
        console.error(`   ❌ Error migrando ${docId}: ${err.message}`);
        errors++;
      }
    }
  }

  return { total: totalDocs, migrated, errors };
}

async function main() {
  console.log('🚀 Iniciando migración de colecciones de resultados...');
  if (DRY_RUN) {
    console.log('⚠️  Modo DRY-RUN: no se escribirá ningún dato.\n');
  }

  console.log('→ Iniciando sesión...');
  const cred = await signInWithEmailAndPassword(auth, 'usuario1@test.com', '123456');
  console.log(`  Usuario: ${cred.user.email} (UID: ${cred.user.uid})`);

  let totalGlobal = 0;
  let migratedGlobal = 0;
  let errorsGlobal = 0;

  for (const col of OLD_COLLECTIONS) {
    const { total, migrated, errors } = await migrateCollection(col);
    totalGlobal += total;
    migratedGlobal += migrated;
    errorsGlobal += errors;
  }

  await signOut(auth);

  console.log('\n═══════════════════════════════════════');
  console.log(`📊  Total documentos leídos:    ${totalGlobal}`);
  console.log(`📝  Total documentos migrados:  ${migratedGlobal}`);
  if (errorsGlobal > 0) {
    console.log(`❌  Total errores:              ${errorsGlobal}`);
  }
  if (DRY_RUN) {
    console.log('⚠️  DRY-RUN: no se escribieron datos.');
  } else {
    console.log('✅  Los datos se migraron preservando los IDs originales.');
    console.log('    Si se vuelve a ejecutar, sobrescribirá los mismos docs (idempotente).');
  }
  console.log('═══════════════════════════════════════\n');

  if (!DRY_RUN && migratedGlobal > 0) {
    console.log('💡  Las colecciones antiguas no se eliminaron.');
    console.log('   Si todo se ve bien, podés borrarlas desde la consola de Firebase:');
    OLD_COLLECTIONS.forEach(c => console.log(`   - ${c.name}`));
  }

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error general:', err.message);
  process.exit(1);
});
