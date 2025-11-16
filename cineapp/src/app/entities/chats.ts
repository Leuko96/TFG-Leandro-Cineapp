export interface Chats {
  id: string;
  participants: string[]; // IDs de los usuarios participantes
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string; // Último mensaje del chat
  displayNames?: { [userId: string]: string }; // Nombres para mostrar de los participantes
  avatarUrls?: { [userId: string]: string }; // URLs de avatares de los participantes
  typingStatus?: { [userId: string]: boolean }; // Estado de escritura de los participantes
  unReadCounts?: { [userId: string]: number }; // Conteo de mensajes no leídos por usuario
  
}