import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { notificationType } from '../entities/notification';
// import { SocialNetworkService } from '../services/social-network.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'
import { UsuariosService } from '../services/usuarios.service';
import { SocialNetworkService } from '../services/social-network.service';
import { DocumentData, Firestore, doc, getDoc,DocumentSnapshot } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { NotificationsService } from '../services/notifications.service';


@Component({
  selector: 'app-social-network',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './social-network.component.html',
  styleUrl: './social-network.component.css'
})
export class SocialNetworkComponent {
    isLoading: boolean = true
    listFriends: DocumentData[] = [];
    isSearching: boolean = false;
    searchResults: DocumentData[] = [];
    searchTerm: string = '';
    nombre: string = "";
    email: string = "";
    usrUid:string = "";
    //Mensajes
    activeChatFriendId: string | null = null;
    activeChatFriendName: string = '';
    activeChatFriendAvatar: string = '';
    activeChatFriendOnline: boolean = false;
    activeChatFriendTyping: boolean = false;
    chatMessages: any[] = [];
    messageText: string = '';
    private messagesSub: Subscription | null = null;
    private friendTypingSub: Subscription | null = null;
    private userTypingState: boolean = false;

    constructor(private auth: AuthService, 
                private socialService: SocialNetworkService, private notificationSerice:NotificationsService,
                private firestore: Firestore) {}
  
    async ngOnInit() {
      this.isLoading = true;
      // Asignar UID del usuario autenticado
      this.usrUid = this.auth.getCurrentUser()?.uid || '';
      
      // Marcar usuario como online
      if (this.usrUid) {
        await this.socialService.setUserOnlineStatus(this.usrUid, true);
      }
      
      await this.socialService.loadCurrentUser(this.listFriends, this.usrUid);
      this.isLoading = false;
    }


    notlogged(){
      this.auth.user$.subscribe(user => {
      if (user) {
        return false;
      } else {
        return true;
      }
    })
    }
    async agregarAmigo(otroUid: string) {
      const usr = this.auth.getCurrentUser();
      if(usr){
        const usrDoc = await getDoc(doc(this.firestore,"Usuarios",usr.uid));
        const usrData = usrDoc.data(); 
        this.usrUid = usr.uid;
        if(usrData){
          this.notificationSerice.sendNotification(otroUid,notificationType.FriendRequest, "User " + usrData['nombre'] + " wants to be your friend", usr.uid );
          alert("Friend Request Sent")
        }
      }
    //   const user = this.auth.getCurrentUser; // o donde guardes el usuario autenticado
    //   if (!user) return;
  
    //   const newFriend = await this.socialService.addFriend(otroUid, this.listFriends);
    //   this.cargarAmigos();
    }

    async searchUsers() {
      this.isSearching = true;
      this.searchResults = await this.socialService.searchUsersByName(this.searchTerm.trim());
      console.log("ESTO ES EL RESULTADO 0"+ this.searchResults[0]["id"]);
      this.isSearching = false;
    
    // this.nombre = this.searchResults;

  }

  async deleteFriend(uid: string){
    await this.socialService.removeFriend(uid,this.listFriends);
  }

  //Chat stuff
  openChat(friendId: string, friendName: string, friendAvatar: string = '', friendOnline: boolean = false) {
    this.activeChatFriendId = friendId;
    this.activeChatFriendName = friendName;
    this.activeChatFriendAvatar = friendAvatar;
    this.activeChatFriendOnline = friendOnline;
    // Asegurar UID actual por si acaso
    this.usrUid = this.auth.getCurrentUser()?.uid || this.usrUid;
    // Suscribirse a mensajes en tiempo real
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
      this.messagesSub = null;
    }
    this.messagesSub = this.socialService.getMessagesRealtime(this.usrUid, friendId)
      .subscribe((msgs) => {
        const norm = (msgs || []).map((m: any) => {
          const created = m?.createdAt;
          const dateObj = (created && typeof created.toDate === 'function') ? created.toDate() : (created || null);
          return { ...m, createdAt: dateObj };
        });
        this.chatMessages = norm;
        
        // Marcar mensajes no leídos del otro usuario como leídos
        this.markUnreadMessagesAsRead(friendId);
      }, (err) => {
        console.error('Error en listener de mensajes:', err);
      });

    // Suscribirse al estado de "typing" del amigo
    if (this.friendTypingSub) {
      this.friendTypingSub.unsubscribe();
      this.friendTypingSub = null;
    }
    try {
      const chatId = this.socialService.chatIdFor(this.usrUid, friendId);
      this.friendTypingSub = this.socialService.getTypingStatusRealtime(chatId, friendId)
        .subscribe((isTyping: boolean) => {
          this.activeChatFriendTyping = !!isTyping;
        }, (err: any) => {
          console.error('Error en listener typing:', err);
        });
    } catch (e) {
      // ignore
    }
  }

  /**
   * Marca todos los mensajes no leídos del otro usuario como leídos.
   */
  private async markUnreadMessagesAsRead(friendId: string): Promise<void> {
    if (!this.usrUid || !friendId) return;
    
    try {
      const chatId = this.socialService.chatIdFor(this.usrUid, friendId);
      const unreadMessages = this.chatMessages.filter(m => m.senderId === friendId && !m.read);
      
      for (const msg of unreadMessages) {
        await this.socialService['markMessageAsRead'](chatId, msg.id);
      }
    } catch (err) {
      console.error('Error marcando mensajes como leídos:', err);
    }
  }

  closeChat() {
    this.activeChatFriendId = null;
    this.activeChatFriendName = '';
    this.activeChatFriendAvatar = '';
    this.activeChatFriendOnline = false;
    this.chatMessages = [];
    this.messageText = '';
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
      this.messagesSub = null;
    }
    if (this.friendTypingSub) {
      this.friendTypingSub.unsubscribe();
      this.friendTypingSub = null;
    }
    // ensure we mark typing false when closing
    try {
      if (this.usrUid && this.activeChatFriendId && this.userTypingState) {
        const chatId = this.socialService.chatIdFor(this.usrUid, this.activeChatFriendId);
        this.socialService.setTypingStatus(chatId, this.usrUid, false).catch(() => {});
        this.userTypingState = false;
      }
    } catch (e) {}
  }

  ngOnDestroy(): void {
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
      this.messagesSub = null;
    }
    if (this.friendTypingSub) {
      this.friendTypingSub.unsubscribe();
      this.friendTypingSub = null;
    }
    if (this.userTypingState && this.usrUid && this.activeChatFriendId) {
      try {
        const chatId = this.socialService.chatIdFor(this.usrUid, this.activeChatFriendId);
        this.socialService.setTypingStatus(chatId, this.usrUid, false).catch(() => {});
      } catch (e) {}
      this.userTypingState = false;
    }
    // Marcar usuario como offline al salir del componente
    if (this.usrUid) {
      try {
        if (this.activeChatFriendId) {
          const chatId = this.socialService.chatIdFor(this.usrUid, this.activeChatFriendId);
          this.socialService.setTypingStatus(chatId, this.usrUid, false).catch(() => {});
        }
      } catch (e) {}
      this.socialService.setUserOnlineStatus(this.usrUid, false).catch((err: any) =>
        console.error('Error marking user offline:', err)
      );
    }
  }

  async loadChatMessages(friendId: string) {
    // Cargar mensajes de Chats/{chatId}/Messages
    if (!this.usrUid || !friendId) return;
    
    try {
      const msgs = await this.socialService.getMessages(this.usrUid, friendId);
      // Normalizar createdAt: convertir Timestamp (con toDate) a Date para la plantilla
      const norm = (msgs || []).map((m: any) => {
        const created = m?.createdAt;
        const dateObj = (created && typeof created.toDate === 'function') ? created.toDate() : (created || null);
        return { ...m, createdAt: dateObj };
      });
      this.chatMessages = norm;
      console.log('Mensajes cargados:', this.chatMessages.length);
    } catch (e) {
      console.error('Error cargando mensajes:', e);
      this.chatMessages = [];
    }
  }

  async sendMessage() {
    if (!this.messageText || !this.messageText.trim()) return;
    if (!this.usrUid || !this.activeChatFriendId) {
      console.error('UID o ID de amigo faltante');
      return;
    }

    const textToSend = this.messageText.trim();
    try {
      await this.socialService.sendMessage(this.usrUid, this.activeChatFriendId, textToSend);

      // After sending, clear typing state for self
      try {
        const chatId = this.socialService.chatIdFor(this.usrUid, this.activeChatFriendId);
        this.socialService.setTypingStatus(chatId, this.usrUid, false).catch(() => {});
      } catch (e) {
        // ignore
      }
      if (this.userTypingState && this.usrUid && this.activeChatFriendId) {
        try {
          const chatId = this.socialService.chatIdFor(this.usrUid, this.activeChatFriendId);
          this.socialService.setTypingStatus(chatId, this.usrUid, false).catch(() => {});
        } catch (e) {}
        this.userTypingState = false;
      }

      // No añadir localmente: el listener (getMessagesRealtime) ya actualizará chatMessages desde Firestore
      this.messageText = '';
      console.log('Mensaje enviado exitosamente');
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      alert('No se pudo enviar el mensaje. Revisa la consola.');
    }
  }


  // Llamado al escribir en el input para informar al servidor que el usuario está escribiendo
  onTyping() {
    if (!this.usrUid || !this.activeChatFriendId) return;
    try {
      const chatId = this.socialService.chatIdFor(this.usrUid, this.activeChatFriendId);
      const hasText = !!this.messageText && this.messageText.trim().length > 0;
      if (hasText && !this.userTypingState) {
        // user has typed something and was not previously marked as typing
        this.socialService.setTypingStatus(chatId, this.usrUid, true).catch(() => {});
        this.userTypingState = true;
      } else if (!hasText && this.userTypingState) {
        // input cleared, stop typing
        this.socialService.setTypingStatus(chatId, this.usrUid, false).catch(() => {});
        this.userTypingState = false;
      }
      // If hasText and userTypingState already true, do nothing (keep typing)
    } catch (e) {
      // ignore
    }
  }
}


// NOTA PARA LEANDRO DEL FUTURO, TENGO QUE HACER QUE AL ACEPTAR LA PETICION DE AMISTAD SE AGREGUEN MUTUAMENTE AMBAR PERSONAS, PARA ELLO TENGO QUE 
// INDEPENDIZAR AL SERVICIO DE SOCIAL_NETWORK DEL ID DEL USUARIO AUTENTICADO PARA PASARLE LOS DOS IDS POR ARGUMENTO Y AGREGARSE MUTUAMENTE CON 
// SUS RESPECTIVAS LISTAS QUE ESTO YA SI LO HE HECHO
