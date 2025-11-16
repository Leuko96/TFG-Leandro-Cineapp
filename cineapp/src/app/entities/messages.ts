export interface Messages {
    senderId: string;
    text: string;
    createdAt: Date;
    delivered?: Boolean;
    edited?: Boolean;
    attachments?: string[]; // URLs de archivos adjuntos
}