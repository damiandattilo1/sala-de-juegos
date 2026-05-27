import { Injectable } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { firebaseConfig } from '../../environments/environment';

export interface HangmanResult {
  uid: string;
  email: string;
  nombre: string;
  palabra: string;
  gano: boolean;
  tiempoSegundos: number;
  letrasSeleccionadas: number;
  createdAt?: Timestamp;
}

export interface HigherLowerResult {
  uid: string;
  email: string;
  nombre: string;
  aciertos: number;
  rondasJugadas: number;
  gano: boolean;
  createdAt?: Timestamp;
}

export interface TriviaResult {
  uid: string;
  email: string;
  nombre: string;
  aciertos: number;
  totalPreguntas: number;
  tiempoSegundos: number;
  createdAt?: Timestamp;
}

export interface GeneralaResult {
  uid: string;
  email: string;
  nombre: string;
  puntosJugador: number;
  puntosCpu: number;
  rondasJugadas: number;
  gano: boolean;
  createdAt?: Timestamp;
}

export interface SurveyResult {
  uid: string;
  email: string;
  nombreApellido: string;
  edad: number;
  telefono: string;
  frecuenciaJuego: string;
  generosJuegos: string[];
  juegoFavorito: string;
  sugerencia: string;
  createdAt?: Timestamp;
}

export interface ChatMessage {
  id: string;
  uid: string;
  email: string;
  nombre: string;
  mensaje: string;
  createdAt: Date | null;
}

@Injectable({ providedIn: 'root' })
export class GameDataService {
  private app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  private db: Firestore = getFirestore(this.app);

  async saveHangmanResult(result: Omit<HangmanResult, 'createdAt'>): Promise<void> {
    await addDoc(collection(this.db, 'resultados'), {
      ...result,
      juego: 'ahorcado',
      createdAt: serverTimestamp()
    });
  }

  async saveHigherLowerResult(result: Omit<HigherLowerResult, 'createdAt'>): Promise<void> {
    await addDoc(collection(this.db, 'resultados'), {
      ...result,
      juego: 'mayor-menor',
      createdAt: serverTimestamp()
    });
  }

  async saveTriviaResult(result: Omit<TriviaResult, 'createdAt'>): Promise<void> {
    await addDoc(collection(this.db, 'resultados'), {
      ...result,
      juego: 'preguntados',
      createdAt: serverTimestamp()
    });
  }

  async saveGeneralaResult(result: Omit<GeneralaResult, 'createdAt'>): Promise<void> {
    await addDoc(collection(this.db, 'resultados'), {
      ...result,
      juego: 'generala',
      createdAt: serverTimestamp()
    });
  }

  subscribeHangmanResults(
    onResults: (results: HangmanResult[]) => void,
    onError?: (errorMessage: string) => void
  ): () => void {
    return this.subscribeGameResults<HangmanResult>('ahorcado', onResults, onError);
  }

  subscribeHigherLowerResults(
    onResults: (results: HigherLowerResult[]) => void,
    onError?: (errorMessage: string) => void
  ): () => void {
    return this.subscribeGameResults<HigherLowerResult>('mayor-menor', onResults, onError);
  }

  subscribeTriviaResults(
    onResults: (results: TriviaResult[]) => void,
    onError?: (errorMessage: string) => void
  ): () => void {
    return this.subscribeGameResults<TriviaResult>('preguntados', onResults, onError);
  }

  subscribeGeneralaResults(
    onResults: (results: GeneralaResult[]) => void,
    onError?: (errorMessage: string) => void
  ): () => void {
    return this.subscribeGameResults<GeneralaResult>('generala', onResults, onError);
  }

  async sendChatMessage(uid: string, email: string, nombre: string, mensaje: string): Promise<void> {
    await addDoc(collection(this.db, 'chat_global'), {
      uid,
      email,
      nombre,
      mensaje,
      createdAt: serverTimestamp()
    });
  }

  subscribeChatMessages(
    onMessages: (messages: ChatMessage[]) => void,
    onError?: (errorMessage: string) => void
  ): () => void {
    const chatQuery = query(collection(this.db, 'chat_global'), orderBy('createdAt', 'asc'));

    return onSnapshot(
      chatQuery,
      (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const createdAtRaw = data['createdAt'] as Timestamp | undefined;

          return {
            id: docSnap.id,
            uid: String(data['uid'] ?? ''),
            email: String(data['email'] ?? ''),
            nombre: String(data['nombre'] ?? 'Jugador'),
            mensaje: String(data['mensaje'] ?? ''),
            createdAt: createdAtRaw?.toDate() ?? null
          };
        });

        onMessages(messages);
      },
      (error) => {
        onError?.(error.message);
      }
    );
  }

  async saveSurveyResult(result: Omit<SurveyResult, 'createdAt'>): Promise<void> {
    await addDoc(collection(this.db, 'encuestas'), {
      ...result,
      createdAt: serverTimestamp()
    });
  }

  subscribeSurveyResults(
    onResults: (results: SurveyResult[]) => void,
    onError?: (errorMessage: string) => void
  ): () => void {
    return this.subscribeCollection<SurveyResult>('encuestas', onResults, onError);
  }

  async checkUserHasSurvey(uid: string): Promise<boolean> {
    const q = query(collection(this.db, 'encuestas'), where('uid', '==', uid), limit(1));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  private subscribeGameResults<T extends { createdAt?: Timestamp }>(
    juego: string,
    onResults: (results: T[]) => void,
    onError?: (errorMessage: string) => void
  ): () => void {
    const resultsQuery = query(
      collection(this.db, 'resultados'),
      where('juego', '==', juego),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      resultsQuery,
      (snapshot) => {
        const results = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          return {
            ...data,
            createdAt: data['createdAt'] as Timestamp | undefined
          } as T;
        });

        onResults(results);
      },
      (error) => {
        onError?.(error.message);
      }
    );
  }

  private subscribeCollection<T extends { createdAt?: Timestamp }>(
    collectionName: string,
    onResults: (results: T[]) => void,
    onError?: (errorMessage: string) => void
  ): () => void {
    const resultsQuery = query(collection(this.db, collectionName), orderBy('createdAt', 'desc'));

    return onSnapshot(
      resultsQuery,
      (snapshot) => {
        const results = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          return {
            ...data,
            createdAt: data['createdAt'] as Timestamp | undefined
          } as T;
        });

        onResults(results);
      },
      (error) => {
        onError?.(error.message);
      }
    );
  }
}
