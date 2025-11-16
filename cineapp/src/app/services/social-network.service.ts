import { Injectable } from '@angular/core';
import { Firestore, DocumentData,DocumentSnapshot,collection, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, orderBy,addDoc, serverTimestamp, setDoc, increment, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { UsuariosService } from './usuarios.service';
import { Usuario, UsuarioImpl } from '../entities/usuario';




@Injectable({
  providedIn: 'root'
})
export class SocialNetworkService {

  currentUser?: DocumentData;
  currentUserUid?: string;

  constructor(private firestore: Firestore, 
              private auth: AuthService,
              private userService: UsuariosService) {
    // Inicializar listeners de presencia inmediatamente
    this.setupPresenceListeners();
  }

  // Manage presence: subscribe to auth changes and window visibility to set online/offline
  private visibilityHandler = () => {};
  private beforeUnloadHandler = () => {};

  private setupPresenceListeners() {
    // avoid multiple setups
    if ((this as any)._presenceSetup) return;
    (this as any)._presenceSetup = true;

    this.auth.user$.subscribe((user) => {
      const uid = user?.uid ?? null;
      // If user logged in
      if (uid) {
        this.currentUserUid = uid;
        // set online immediately if visible
        const isVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
        this.setUserOnlineStatus(uid, !!isVisible).catch(() => {});

        // visibility change
        this.visibilityHandler = () => {
          const visible = document.visibilityState === 'visible';
          this.setUserOnlineStatus(uid, visible).catch(() => {});
        };
        document.addEventListener('visibilitychange', this.visibilityHandler);

        // before unload -> set offline
        this.beforeUnloadHandler = () => {
          try { this.setUserOnlineStatus(uid, false); } catch (e) { /* ignore */ }
        };
        window.addEventListener('beforeunload', this.beforeUnloadHandler);
      } else {
        // user logged out: cleanup previous handlers and mark offline if we had uid
        if (this.currentUserUid) {
          this.setUserOnlineStatus(this.currentUserUid, false).catch(() => {});
        }
        try { document.removeEventListener('visibilitychange', this.visibilityHandler); } catch (e) {}
        try { window.removeEventListener('beforeunload', this.beforeUnloadHandler); } catch (e) {}
        this.currentUserUid = undefined;
      }
    });
  }
  
  async loadCurrentUser(listFriends: DocumentData[],usrUid:string){
    // console.log(this.auth.getCurrentUser());
    const usr = this.auth.getCurrentUser();
    if(usr){
      this.currentUserUid = usr.uid;
      usrUid =usr.uid;
      const userDoc = await getDoc(doc(this.firestore,"Usuarios",usr.uid));

      if(userDoc.exists()){
        this.currentUser = userDoc.data();
      }
      
    }


    const amigosUID:string[] = this.currentUser?.['Amigos']?? [];
    console.log("Amigos en OnInit" + amigosUID);
    
    // El resto del método lo hizo chatgpt y no lo entiendo la verdad


    if (amigosUID && amigosUID.length > 0) {
     const friendDocs = await Promise.all(
    amigosUID.map(uid => getDoc(doc(this.firestore, "Usuarios", uid)))
    );

  const friendsData = friendDocs
  .map(docSnap => ({ id: docSnap.id, ...(docSnap.data() || {}) }))
  .filter(data => data !== undefined && data !== null);

    listFriends.push(...friendsData);

}

  
    // if(amigosUID){
    //   for(let i = 0; i < amigosUID.length; i++){
    //     const friendDoc =  await getDoc(doc(this.firestore,"Usuarios",amigosUID[i]));
    //     listFriends.push(friendDoc.data()!);
    //   }
      
    // }
  }


  async loadListFriends(usrId:string,listFriends: DocumentData[]){

    const amigosUID:string[] = await this.getUserFriends(usrId);

    if (amigosUID && amigosUID.length > 0) {
     const friendDocs = await Promise.all(
    amigosUID.map(uid => getDoc(doc(this.firestore, "Usuarios", uid)))
    );

  const friendsData = friendDocs
    .map(docSnap => ({ id: docSnap.id, ...(docSnap.data() || {}) }))
    .filter(data => data !== undefined && data !== null);

    listFriends.push(...friendsData);
  }
}

  /**
   * Actualiza el estado isOnline del usuario en Firestore.
   */
  async setUserOnlineStatus(uid: string, isOnline: boolean): Promise<void> {
    if (!uid) return;
    const userDocRef = doc(this.firestore, 'Usuarios', uid);
    await updateDoc(userDocRef, { isOnline });
  }

  async getUserFriends(usrID:string): Promise<string[]>{
    // const CurrentUserFriends = this.currentUser?.['Amigos']?? [];
    const docFriendsRef = doc(this.firestore,'Usuarios', usrID);
    const dataUsr = (await getDoc(docFriendsRef)).data();
    const getFriends = dataUsr?.['Amigos']?? []; 

    return getFriends; 
  }

  async addFriend(uid:string, listFriends: DocumentData[]){
    const usr = this.auth.getCurrentUser();
    if(usr){
 
      this.currentUserUid = usr.uid;    
      const userDoc = await getDoc(doc(this.firestore,"Usuarios",usr.uid));

      if(userDoc.exists()){
        this.currentUser = userDoc.data();
      }
      
    }
    if (!this.currentUser || !this.currentUserUid) {
      console.warn('Usuario no cargado todavía');
      return;
    }

    const amigos = await this.getUserFriends(this.currentUserUid);
    alert("addFriend: uid externo del autenticado: " + uid);  
    const amigosFriend = await this.getUserFriends(uid);
    // Evita duplicados
    if (!amigos.includes(uid) && !amigosFriend.includes(this.currentUserUid)) {
      amigos.push(uid);
      amigosFriend.push(this.currentUserUid);

      const docFriendRef = doc(this.firestore,"Usuarios",uid);
      const friendData = (await getDoc(docFriendRef)).data();;
      if(friendData){
        listFriends.push(friendData);
        this.currentUser['Amigos'] = amigos;
        friendData['Amigos'] = amigosFriend;
      }
      
      const docRef = doc(this.firestore, 'Usuarios', this.currentUserUid);

      alert(amigos);
      await updateDoc(docRef, { Amigos: amigos });
      await updateDoc(docFriendRef, { Amigos: amigosFriend });
      
    }

  }


  async removeFriend(uid:string, listFriends:DocumentData[]){
    if (!this.currentUser || !this.currentUserUid) return;
    const friendsLst = await this.getUserFriends(this.currentUserUid) 
    const amigos = friendsLst.filter(a => a !== uid);
    this.currentUser['Amigos'] = amigos;

    const docRef = doc(this.firestore, 'Usuarios', this.currentUserUid);
    await updateDoc(docRef, { Amigos: amigos });
    
    console.log("UID DEL AMIGO A BORRAR " + uid);
    const docFriend = doc(this.firestore, 'Usuarios', uid);
    const idx = listFriends.findIndex(friend => friend['id']===uid);
    console.log("Amigo a borrar" + idx);
    if (idx !== -1) {
      listFriends.splice(idx, 1);
    }
  }

  public async searchUsersByName(name: string): Promise<DocumentData[]> {
    const usersRef = collection(this.firestore, 'Usuarios');
    const q = query(usersRef, where('nombre', '>=', name), where('nombre', '<=', name + '\uf8ff'), where('nombre', '!=',this.currentUser?.['nombre']??''));

    const querySnapshot = await getDocs(q);
    const results: DocumentData[] = [];

    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    return results;
  }

  // Helper para generar un id de chat determinista entre dos usuarios
  public chatIdFor(u1: string, u2: string): string {
    if (!u1 || !u2) throw new Error('UIDs inválidos para generar chatId');
    return [u1, u2].sort().join('_');
  }

  /**
   * Crea o obtiene un documento de chat en Chats/{chatId}.
   * Inicializa con participants, createdAt, updatedAt, lastMessage, unReadCounts.
   */
  async createOrGetChat(u1: string, u2: string): Promise<string> {
    if (!u1 || !u2) throw new Error('UIDs inválidos');
    const chatId = this.chatIdFor(u1, u2);
    const chatDocRef = doc(this.firestore, `Chats/${chatId}`);
    const chatSnap = await getDoc(chatDocRef);

    const userDoc1 = getDoc(doc(this.firestore,"Usuarios",u1));
    const userDoc2 = getDoc(doc(this.firestore,"Usuarios",u2));
    const userData1 = (await userDoc1).data();
    const userData2 = (await userDoc2).data();

    if (!chatSnap.exists()) {
      // Crear documento del chat
      await setDoc(chatDocRef as any, {
        id: chatId,
        participants: [u1, u2],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: '',
        unReadCounts: { [u1]: 0, [u2]: 0 },
        displayNames: { [u1]: userData1?.['nombre']??'Unknown', [u2]: userData2?.['nombre']??'Unknown'},
        avatarUrls: { [u1]: userData1?.['avatar']??'', [u2]: userData2?.['avatar']??''},
        typingStatus: { [u1]: false, [u2]: false }
      });
    }
    return chatId;
  }

  /**
   * Establece el estado de escritura para un usuario dentro del chat.
   */
  async setTypingStatus(chatId: string, uid: string, isTyping: boolean): Promise<void> {
    if (!chatId || !uid) return;
    const chatDocRef = doc(this.firestore, `Chats/${chatId}`);
    await updateDoc(chatDocRef, { [`typingStatus.${uid}`]: isTyping });
  }

  /**
   * Escucha el estado de escritura del amigo en tiempo real (typingStatus del chat).
   */
  getTypingStatusRealtime(chatId: string, friendId: string): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      if (!chatId || !friendId) {
        observer.next(false);
        observer.complete();
        return;
      }
      const chatDocRef = doc(this.firestore, `Chats/${chatId}`);
      const unsubscribe = onSnapshot(chatDocRef as any, (snap: any) => {
        const val = snap.data()?.typingStatus?.[friendId] ?? false;
        observer.next(val);
      }, (err: any) => observer.error(err));

      return () => { try { unsubscribe(); } catch (e) {} };
    });
  }

  /**
   * Obtiene los mensajes de un chat específico.
   * Retorna un array de mensajes ordenados por createdAt ascendente.
   */
  async getMessages(u1: string, u2: string): Promise<any[]> {
    if (!u1 || !u2) return [];

    const chatId = this.chatIdFor(u1, u2);
    const messagesCol = collection(this.firestore, `Chats/${chatId}/Messages`);
    const q = query(messagesCol, orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    const msgs: any[] = [];
    snap.forEach(docSnap => {
      msgs.push({ id: docSnap.id, ...docSnap.data() });
    });
    return msgs;
  }

  /**
   * Devuelve un Observable que emite el array de mensajes en tiempo real.
   */
  getMessagesRealtime(u1: string, u2: string): Observable<any[]> {
    return new Observable<any[]>((observer) => {
      if (!u1 || !u2) {
        observer.next([]);
        observer.complete();
        return;
      }

      const chatId = this.chatIdFor(u1, u2);
      const messagesCol = collection(this.firestore, `Chats/${chatId}/Messages`);
      const q = query(messagesCol, orderBy('createdAt', 'asc'));

      const unsubscribe = onSnapshot(q as any, (snap: any) => {
        const msgs: any[] = [];
        snap.forEach((docSnap: any) => {
          msgs.push({ id: docSnap.id, ...docSnap.data() });
        });
        observer.next(msgs);
      }, (err: any) => {
        observer.error(err);
      });

      return () => {
        try { unsubscribe(); } catch (e) { /* ignore */ }
      };
    });
  }

  /**
   * Envía un mensaje desde usrId a chatFriendId.
   * Crea/obtiene el chat, añade el mensaje y actualiza metadatos.
   */
  async sendMessage(usrId: string, chatFriendId: string, textMessage: string) {
    if (!usrId || !chatFriendId) throw new Error('UIDs inválidos para enviar mensaje');
    if (!textMessage || !textMessage.trim()) throw new Error('Mensaje vacío');

    const chatId = await this.createOrGetChat(usrId, chatFriendId);
    const messagesCol = collection(this.firestore, `Chats/${chatId}/Messages`);

    // Añadir mensaje
    await addDoc(messagesCol as any, {
      senderId: usrId,
      text: textMessage,
      createdAt: serverTimestamp(),
      delivered: true,
      read: false,
      edited: false,
      attachments: []
    });

    // Actualizar metadatos del chat
    const chatDocRef = doc(this.firestore, `Chats/${chatId}`);
    await updateDoc(chatDocRef, {
      lastMessage: textMessage,
      updatedAt: serverTimestamp(),
      [`unReadCounts.${chatFriendId}`]: increment(1) // Incrementar no leídos para el otro usuario
    });
  }

  /**
   * Marca un mensaje como leído.
   */
  async markMessageAsRead(chatId: string, messageId: string): Promise<void> {
    if (!chatId || !messageId) return;
    const messageDocRef = doc(this.firestore, `Chats/${chatId}/Messages/${messageId}`);
    await updateDoc(messageDocRef, { read: true });
  }

}
