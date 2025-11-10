import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { UsuariosService } from './usuarios.service';
import { Usuario, UsuarioImpl } from '../entities/usuario';
import { DocumentData } from '@angular/fire/firestore';
import { DocumentSnapshot } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class SocialNetworkService {

  currentUser?: DocumentData;
  currentUserUid?: string;

  constructor(private firestore: Firestore, 
              private auth: AuthService,
              private userService: UsuariosService) {}
  
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
    .map(docSnap => docSnap.data())
    .filter((data): data is DocumentData => data !== undefined); // <- Esto aclara el tipo

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
    amigosUID.map(uid => getDoc(doc(this.firestore, "Usuarios", usrId)))
    );

  const friendsData = friendDocs
    .map(docSnap => docSnap.data())
    .filter((data): data is DocumentData => data !== undefined); // <- Esto aclara el tipo

    listFriends.push(...friendsData);
  }
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
    const q = query(usersRef, where('nombre', '>=', name), where('nombre', '<=', name + '\uf8ff'));

    const querySnapshot = await getDocs(q);
    const results: DocumentData[] = [];

    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    return results;
  }

  async getMessages(a:string, b:string):Promise<any>{

  }
  async sendMessage(a:string, b:string, c:string){

  }

}
