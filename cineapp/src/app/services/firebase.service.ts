import { Injectable } from '@angular/core';
import { collection, getDocs } from "firebase/firestore";
// import { db } from '../../main';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  async getUsuarios() {
    // const querySnapshot = await getDocs(collection(db, "usuarios"));
    // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}