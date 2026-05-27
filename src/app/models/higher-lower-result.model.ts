import { Timestamp } from 'firebase/firestore';

export interface HigherLowerResult {
  uid: string;
  email: string;
  nombre: string;
  aciertos: number;
  rondasJugadas: number;
  gano: boolean;
  createdAt?: Timestamp;
}
