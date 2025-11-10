import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterOutlet } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
// import { doc, setDoc, getDoc, addDoc } from "firebase/firestore";
import { Firestore,collection, addDoc, setDoc, doc, getDoc} from "@angular/fire/firestore"
import { getFirestore } from "firebase/firestore";
import { AuthService } from '../services/auth.service';
import { Register } from '../entities/register'
import { passwords } from '../services/usuarios.db.service';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, RouterOutlet],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    registerInfo: Register = {email: '', password: '', favourite_film: '', name: '', surname1: '', surname2:''};
        error: string = '';

        constructor(private auth: AuthService, private router: Router, private firestore: Firestore) {}
        async register(){
          try{
            
            const user = await this.auth.register(this.registerInfo.email,this.registerInfo.password);
            // const db = getFirestore();


            await setDoc(doc(this.firestore,"Usuarios", user.uid),
              {
                administrador: false,
                apellido1: this.registerInfo.surname1,
                apellido2: this.registerInfo.surname2,
                email: this.registerInfo.email,
                fecha_registro: new Date(),
                nombre: this.registerInfo.name,
                password: this.registerInfo.password,
              }
            );
            console.log("1. ID de usr.uid, 2. ID del documento");
            console.log(user.uid);
            console.log((await getDoc(doc(this.firestore,"Usuarios",user.uid))).id);

            this.router.navigate(['/inicio']);
          }catch(error: any){
            this.error = error.message;
          }
        }
        // login() {
        //   this.usuarioService.doLogin(this.registerInfo).subscribe({
        //     next: (usuario) => {
        //       this.router.navigate(['/inicio']);
        //     },
        //     error: (error) => {
        //       this.registerInfo = {email: '', password: '', favourite_film: '', name: '', surname1: '', surname2:''};
        //       if (error.status === 401) {
        //         this.error = 'Usuario o contraseña incorrectos';
        //       } else {
        //         this.error = error.statusText;
        //       }
      
        //     }
        //   });
        // }
        
      
        // get usuario() {
        //   return this.usuarioService.getUsuarioSesion();
        // }
}
