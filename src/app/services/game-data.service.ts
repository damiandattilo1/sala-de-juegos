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
}
