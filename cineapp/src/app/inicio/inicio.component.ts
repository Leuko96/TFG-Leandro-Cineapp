import { Component } from '@angular/core';
import { Usuario, UsuarioImpl } from '../entities/usuario';
import { UsuariosService } from '../services/usuarios.service';
import { FirebaseService } from '../services/firebase.service';
import { AuthService } from '../services/auth.service';
import { NotificationsService } from '../services/notifications.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { doc, getDoc , Firestore, DocumentData} from '@angular/fire/firestore';
import { user } from '@angular/fire/auth';
import { getApp, provideFirebaseApp } from '@angular/fire/app';
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { notificationType } from '../entities/notification';
import { SocialNetworkService } from '../services/social-network.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class InicioComponent {
  
  showNotifications = false;
  nombre: string = "";
  apellido1: string = "";
  apellido2: string = "";
  fecharegistro: Date = new Date();
  email: string = "a";
  usrId: string = "";
  notificationsList: any[] = [];
  enumBoolean = notificationType;
  
  listFriends: DocumentData[] = [];
  listFriendsSender: DocumentData[] = [];
  constructor(
    private usuarioService: UsuariosService, private auth: AuthService, 
    private firestore : Firestore, private notifications: NotificationsService,
    private socialService: SocialNetworkService
    
  ) {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.email = user.email?? "null" ;
        this.apellido1 = user.uid?? "null";
      } else {
        console.log("No hay sesión");
      }
    });



    this.nombre = this.auth.getCurrentUser()?.email ?? "null";
    this. apellido1 = this.auth.getCurrentUser()?.uid ?? "null";
    
    // this. apellido2 = this.usuarioSesion?.apellido1 ?? "null";
    // this.fecharegistro = this.usuarioSesion?.fecha_registro?? new Date(0,0,0);
    // this.actualizarRol();
    // 
   
  }

  async run(){
    // if(notificationType.FriendRequest==""){

    // }
    const app = getApp();
    const ai = getAI(app, {backend: new GoogleAIBackend});
    const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
    const prompt = "Write a story about a magic backpack."

    // To generate text output, call generateContent with the text input
    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response.text();
    console.log(text);
  }

  async ngOnInit() {
    console.log(true);
    // this.run();
    // const usuarios = await this.fbService.getUsuarios();
    // console.log("Usuarios Firestore:", usuarios);
    const user = this.auth.getCurrentUser();
    if(user){

      this.notificationsList = await this.notifications.getNotifications(user.uid);
      this.usrId = user.uid;
      const docRef = doc(this.firestore,"Usuarios",user.uid);
      const userDoc = await getDoc(docRef); 
      if(userDoc.exists()){
        const data = userDoc.data();
        this.nombre = data['nombre'];
        this.apellido1 = data["apellido1"];
        this.apellido2 = data["apellido2"];
        this.email = data["email"];
        this.fecharegistro = data["fecha_registro"].toDate();
      }
    }
  }
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
  
  get usuarioSesion() {
    return this.auth.getCurrentUser()?.displayName;
  }
  
  async toggleNotifications() {
    if(!this.showNotifications){
      await this.notifications.setAllAsRead(this.usrId,this.notificationsList);
      console.log(this.notifications);
    }
    this.showNotifications = !this.showNotifications;
  }

  get unreadNotificationsCount(): number {
    return this.notificationsList.filter(n => !n.read).length;
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadNotificationsCount > 0;
  }

  async markRead(notifId: string) {
    await this.notifications.setAsRead(this.usrId, notifId);
    this.notificationsList = this.notificationsList.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    );
  }

    async removeNotification(notifId: string){
      await this.notifications.deleteNotifications(this.usrId,notifId);
      this.notificationsList = this.notificationsList.filter(n => n.id !== notifId);
    }
    
    async addFriendFromNot(notiIfid: string) {
      // const usr = this.auth.getCurrentUser; 
      // if (!usr) return;

      // const docNotRef = doc(this.firestore,`Usuarios/${this.usrId}/Notifications/${notiIfid}`)
      // const docNot = await getDoc(docNotRef);
      // const newFriendId = docNot.data()?.['sender']?? "";

      // if(newFriendId==""){
      //   console.log("Sender not located");
      //   return;
      // }else{
      //   console.log("Sender localizado")
      //   await this.socialService.loadListFriends(newFriendId, this.listFriendsSender);
      //   await this.socialService.loadListFriends(this.usrId, this.listFriends);
      //   await this.socialService.addFriend(this.usrId, this.listFriends);

      //   this.removeNotification(notiIfid)
      // }

      const docNotRef = doc(this.firestore, "Usuarios", this.usrId, "Notifications", notiIfid);

      const docNot = (await getDoc(docNotRef)).data();
      console.log(docNot);
      if(docNot){
        const newFriendId = docNot['senderId'];
        await this.socialService.addFriend(newFriendId, this.listFriends);
        await this.removeNotification(notiIfid)
      }
    }
}
