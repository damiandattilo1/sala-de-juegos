import { Timestamp } from 'firebase/firestore';

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
