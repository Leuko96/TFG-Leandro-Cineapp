import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, setDoc, query, getDocs, writeBatch, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private firestore: Firestore, private auth:AuthService) { }

  

  async sendNotification(destinyUserId: string, typeNot: string, textNot: string, senderIdNot: string, ) {
   
    const notificacionesRef = collection(this.firestore, `Usuarios/${destinyUserId}/Notifications`);
    await addDoc(notificacionesRef, {
      type: typeNot,
      text: textNot,
      senderId: senderIdNot,
      date: new Date(),
      read: false,
    });
    
  }

  async setAsRead(notificationId: string, userId:string){
    const notRef = doc(this.firestore, `Usuarios/${userId}/Notifications`,notificationId);
    await setDoc(notRef,{read:true})
  }

  async setAllAsRead(userId:string, notifications: any[]){
    // const notifCollectionRef = collection(this.firestore,`Usuarios/${userId}/Notifications`); 

    // const batch = writeBatch(this.firestore);

    notifications.forEach(notif => {
      if(!notif.read){
        const notifDocRef = doc(this.firestore, `Usuarios/${userId}/Notifications/`,notif.id);
        updateDoc(notifDocRef,{read:true})
        // batch.update(notifDocRef, {read: true});
      }
    });

    // batch.commit();
  }

  async getNotifications(usuarioId: string) {
    const notificacionesRef = collection(this.firestore, `Usuarios/${usuarioId}/Notifications`);
    const q = query(notificacionesRef);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async deleteNotifications(userId:string,notificationId:string){
    const docRef = doc(this.firestore, "Usuarios",userId,"Notifications",notificationId);
    await deleteDoc(docRef);
  }
}
