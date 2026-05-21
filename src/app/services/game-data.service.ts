import { Injectable } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
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
    await addDoc(collection(this.db, 'resultados_ahorcado'), {
      ...result,
      createdAt: serverTimestamp()
    });
  }

  async saveHigherLowerResult(result: Omit<HigherLowerResult, 'createdAt'>): Promise<void> {
    await addDoc(collection(this.db, 'resultados_mayor_menor'), {
      ...result,
      createdAt: serverTimestamp()
    });
  }

  async saveTriviaResult(result: Omit<TriviaResult, 'createdAt'>): Promise<void> {
    await addDoc(collection(this.db, 'resultados_preguntados'), {
      ...result,
      createdAt: serverTimestamp()
    });
  }

  async saveGeneralaResult(result: Omit<GeneralaResult, 'createdAt'>): Promise<void> {
    await addDoc(collection(this.db, 'resultados_generala'), {
      ...result,
      createdAt: serverTimestamp()
    });
  }

  subscribeHangmanResults(
    onResults: (results: HangmanResult[]) => void,
    onError?: (errorMessage: string) => void
  ): () => void {
    return this.subscribeCollection<HangmanResult>('resultados_ahorcado', onResults, onError);
  }

  subscribeHigherLowerResults(
    onResults: (results: HigherLowerResult[]) => void,
    onError?: (errorMessage: string) => void
  ): () => void {
    return this.subscribeCollection<HigherLowerResult>('resultados_mayor_menor', onResults, onError);
  }

  subscribeTriviaResults(
    onResults: (results: TriviaResult[]) => void,
    onError?: (errorMessage: string) => void
  ): () => void {
    return this.subscribeCollection<TriviaResult>('resultados_preguntados', onResults, onError);
  }

  subscribeGeneralaResults(
    onResults: (results: GeneralaResult[]) => void,
    onError?: (errorMessage: string) => void
  ): () => void {
    return this.subscribeCollection<GeneralaResult>('resultados_generala', onResults, onError);
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
