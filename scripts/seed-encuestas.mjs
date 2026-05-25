/**
 * seed-encuestas.mjs
 * Populates Firestore 'encuestas' collection with test data for the 3 test users.
 * Run with: node scripts/seed-encuestas.mjs
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  addDoc,
  collection,
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const testUsers = [
  { email: 'usuario1@test.com', password: '123456' },
  { email: 'usuario2@test.com', password: '123456' },
  { email: 'usuario3@test.com', password: '123456' },
];

const surveysByUser = [
  // ── Usuario 1 ──────────────────────────────────────
  [
    {
      nombreApellido: 'Lucía Fernández',
      edad: 24,
      telefono: '1156789012',
      frecuenciaJuego: 'Frecuentemente',
      generosJuegos: ['Trivia', 'Estrategia'],
      juegoFavorito: 'Preguntados',
      sugerencia: 'Me gustaría que agreguen más categorías de preguntas en Preguntados.',
    },
    {
      nombreApellido: 'Lucía Fernández',
      edad: 24,
      telefono: '1156789012',
      frecuenciaJuego: 'Siempre',
      generosJuegos: ['Trivia', 'Acción'],
      juegoFavorito: 'Ahorcado',
      sugerencia: 'El Ahorcado está muy bien implementado, agregaría más palabras difíciles.',
    },
  ],
  // ── Usuario 2 ──────────────────────────────────────
  [
    {
      nombreApellido: 'Martín Gómez',
      edad: 32,
      telefono: '1145678901',
      frecuenciaJuego: 'A veces',
      generosJuegos: ['Deportes', 'Estrategia', 'Acción'],
      juegoFavorito: 'Mayor o Menor',
      sugerencia: 'Estaría bueno poder ver el historial de cartas en Mayor o Menor.',
    },
    {
      nombreApellido: 'Martín Gómez',
      edad: 32,
      telefono: '1145678901',
      frecuenciaJuego: 'A veces',
      generosJuegos: ['Deportes', 'Aventura'],
      juegoFavorito: 'Generala Simple',
      sugerencia: 'La Generala es mi favorita, podrían agregar más variantes del juego.',
    },
    {
      nombreApellido: 'Martín Gómez',
      edad: 33,
      telefono: '1145678901',
      frecuenciaJuego: 'Frecuentemente',
      generosJuegos: ['Estrategia'],
      juegoFavorito: 'Mayor o Menor',
      sugerencia: 'Muy buena aplicación, fácil de usar y entretenida.',
    },
  ],
  // ── Usuario 3 ──────────────────────────────────────
  [
    {
      nombreApellido: 'Valentina López',
      edad: 28,
      telefono: '1167890123',
      frecuenciaJuego: 'Siempre',
      generosJuegos: ['Acción', 'Trivia', 'Aventura'],
      juegoFavorito: 'Ahorcado',
      sugerencia: 'Me encanta el diseño de la aplicación, muy moderno y fácil de navegar.',
    },
    {
      nombreApellido: 'Valentina López',
      edad: 28,
      telefono: '1167890123',
      frecuenciaJuego: 'Siempre',
      generosJuegos: ['Trivia', 'Aventura', 'Estrategia'],
      juegoFavorito: 'Preguntados',
      sugerencia: 'Agregaría un modo multijugador para competir con amigos en tiempo real.',
    },
  ],
];

async function seedUser(user, surveysData) {
  console.log(`\n→ Iniciando sesión como ${user.email}...`);
  const cred = await signInWithEmailAndPassword(auth, user.email, user.password);
  const uid = cred.user.uid;
  console.log(`  UID: ${uid}`);

  for (let i = 0; i < surveysData.length; i++) {
    const survey = surveysData[i];
    await addDoc(collection(db, 'encuestas'), {
      uid,
      email: user.email,
      ...survey,
      createdAt: Timestamp.fromDate(new Date(Date.now() - (surveysData.length - i) * 3600000)),
    });
    console.log(`  ✓ Encuesta ${i + 1} guardada: "${survey.sugerencia.slice(0, 40)}..."`);
  }

  await signOut(auth);
}

async function main() {
  console.log('🌱 Iniciando carga de datos de prueba para encuestas...\n');
  for (let i = 0; i < testUsers.length; i++) {
    await seedUser(testUsers[i], surveysByUser[i]);
  }
  console.log('\n✅ Listo! Todos los datos de prueba fueron cargados en Firestore.\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
