import { inject, Injectable } from '@angular/core';
import { Auth, provideAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User, signOut, validatePassword, getAuth, onAuthStateChanged, user} from "@angular/fire/auth";
// import { doc, setDoc, getDoc, Firestore, addDoc } from "firebase/firestore";
// import { getFirestore } from "firebase/firestore"
import { BehaviorSubject } from 'rxjs';
import { doc , Firestore, getDoc} from "@angular/fire/firestore"

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private userSubject = new BehaviorSubject<User | null>(null);
  private firestore = inject(Firestore);
  user$ = this.userSubject.asObservable();

  constructor(){
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }
  // 

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

  getCurrentUser() {
    const usr = this.auth.currentUser;
    if(usr){
      const displayName = usr.displayName
      const email = usr.email;
      // const photoURL = usr.photoURL;
      // const emailVerified = usr.emailVerified;
      const uid = usr.uid;
    }
    return this.auth.currentUser;
  }

  // async getDocumentProfile(uid, colecction_name: string){
  //   const docref = doc(this.firestore,colecction_name,uid);
  //   const userDoc = await getDoc(docref);
  //   return userDoc;
  // }
  
}
