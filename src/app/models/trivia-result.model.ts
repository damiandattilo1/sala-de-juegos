import { Timestamp } from 'firebase/firestore';

export interface TriviaResult {
  uid: string;
  email: string;
  nombre: string;
  aciertos: number;
  totalPreguntas: number;
  tiempoSegundos: number;
  createdAt?: Timestamp;
}
