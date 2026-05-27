import { Timestamp } from 'firebase/firestore';

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
