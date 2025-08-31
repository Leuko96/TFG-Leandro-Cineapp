import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '../../main';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = getAuth();

  async register(email: string, password: string, nombre: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    // Guardar datos extra en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nombre,
      email: user.email,
      fecha_registro: new Date(),
      rol: "usuario"
    });

    return user;
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    // Recuperar perfil de Firestore
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    return userDoc.exists() ? userDoc.data() : null;
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }
}
