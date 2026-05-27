import { Timestamp } from 'firebase/firestore';

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
