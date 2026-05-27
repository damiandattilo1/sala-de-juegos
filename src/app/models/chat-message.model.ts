export interface ChatMessage {
  id: string;
  uid: string;
  email: string;
  nombre: string;
  mensaje: string;
  createdAt: Date | null;
}
