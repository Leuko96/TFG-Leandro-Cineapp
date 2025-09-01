import { inject, Injectable } from '@angular/core';
import { Auth, provideAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, validatePassword} from "@angular/fire/auth";
import { doc, setDoc, getDoc, Firestore, addDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore"


@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  
  // private firestore = inject(Firestore);

   async register(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  async logout() {
    return signOut(this.auth);
  }

  // getCurrentUser() {
  //   return this.auth.currentUser;
  // }
  // async register(email: string, password: string, nombre: string) {
  //   const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
  //   const user = userCredential.user;

  //   // Guardar datos extra en Firestore
  //   await setDoc(doc(db, "usuarios", user.uid), {
  //     nombre,
  //     email: user.email,
  //     fecha_registro: new Date(),
  //     rol: "usuario"
  //   });

  //   return user;
  // }

  // async login(email: string, password: string) {
  //   const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
  //   const user = userCredential.user;

  //   // Recuperar perfil de Firestore
  //   const userDoc = await getDoc(doc(db, "usuarios", user.uid));
  //   return userDoc.exists() ? userDoc.data() : null;
  // }

  getCurrentUser() {
    return this.auth.currentUser;
  }
}
