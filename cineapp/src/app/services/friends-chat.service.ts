import { Injectable } from '@angular/core';
import { Firestore, getDoc, setDoc, doc, collection, addDoc, query, onSnapshot, orderBy } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class FriendsChatService {

  constructor(private firestore: Firestore) { }

  getChatId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
  }

  async createChatIfNotExists(uid1: string, uid2: string) {
    const chatId = this.getChatId(uid1, uid2);

    // crear el chat en ambos usuarios si no existe
    for (const uid of [uid1, uid2]) {
      const chatRef = doc(this.firestore, `Usuarios/${uid}/Chats/${chatId}`);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          users: [uid1, uid2],
          createdAt: new Date()
        });
      }
    }

    return chatId;
  }

  async sendMessage(senderId: string, receiverId: string, text: string) {
    const chatId = this.getChatId(senderId, receiverId);

    // Enviar el mensaje a AMBOS usuarios
    for (const uid of [senderId, receiverId]) {
      const messagesRef = collection(this.firestore, `Usuarios/${uid}/Chats/${chatId}/Messages`);
      await addDoc(messagesRef, {
        senderId,
        text,
        timestamp: new Date()
      });
    }
  }

  listenToMessages(currentUid: string, friendUid: string, callback: (messages: any[]) => void) {
    const chatId = this.getChatId(currentUid, friendUid);
    const messagesRef = collection(this.firestore, `Usuarios/${currentUid}/Chats/${chatId}/Messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, snapshot => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  }
}
