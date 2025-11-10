import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { notificationType } from '../entities/notification';
// import { SocialNetworkService } from '../services/social-network.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'
import { UsuariosService } from '../services/usuarios.service';
import { SocialNetworkService } from '../services/social-network.service';
import { DocumentData, Firestore, doc, getDoc } from '@angular/fire/firestore';
import { NotificationsService } from '../services/notifications.service';
import { DocumentSnapshot } from 'firebase/firestore';

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
    chatMessages: any[] = [];
    messageText: string = '';

    constructor(private auth: AuthService, 
                private socialService: SocialNetworkService, private notificationSerice:NotificationsService,
                private firestore: Firestore) {}
  
    async ngOnInit() {
      this.isLoading = true;
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
  openChat(friendId: string, friendName: string) {
    this.activeChatFriendId = friendId;
    this.activeChatFriendName = friendName;
    this.loadChatMessages(friendId);
  }

  closeChat() {
    this.activeChatFriendId = null;
    this.chatMessages = [];
    this.messageText = '';
  }

  async loadChatMessages(friendId: string) {
    // Cargar mensajes desde Firestore usando tu estructura:
    // Usuarios/{usrId}/Chats/{friendId}/Messages
    // Suscribirse en tiempo real para que aparezcan automáticamente
    this.chatMessages = await this.socialService.getMessages(this.auth.getCurrentUser()?.uid!, friendId);
  }

  async sendMessage() {
    if (!this.messageText.trim()) return;
    await this.socialService.sendMessage(this.auth.getCurrentUser()?.uid!, this.activeChatFriendId!, this.messageText);
    this.messageText = '';
  }
}


// NOTA PARA LEANDRO DEL FUTURO, TENGO QUE HACER QUE AL ACEPTAR LA PETICION DE AMISTAD SE AGREGUEN MUTUAMENTE AMBAR PERSONAS, PARA ELLO TENGO QUE 
// INDEPENDIZAR AL SERVICIO DE SOCIAL_NETWORK DEL ID DEL USUARIO AUTENTICADO PARA PASARLE LOS DOS IDS POR ARGUMENTO Y AGREGARSE MUTUAMENTE CON 
// SUS RESPECTIVAS LISTAS QUE ESTO YA SI LO HE HECHO
