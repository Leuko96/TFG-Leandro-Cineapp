import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterOutlet } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
// import { doc, setDoc, getDoc, addDoc } from "firebase/firestore";
import { Firestore,collection, addDoc, setDoc, doc, getDoc, query, where, getDocs} from "@angular/fire/firestore"
import { getFirestore } from "firebase/firestore";
import { AuthService } from '../services/auth.service';
import { Register } from '../entities/register'
import { List } from '../entities/lists';
import { passwords } from '../services/usuarios.db.service';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, RouterOutlet],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerInfo: Register = {email: '', password: '', favourite_film: '', nombre: '', apellido1: '', apellido2:'', avatar:'', username: '', fecha_registro: new Date(), administrador: false};

  error: string = '';
  selectedImagePreview: string = ''
  constructor(private auth: AuthService, private router: Router, private firestore: Firestore) {this.selectedImagePreview = 'assets/avatar-default.jpeg';}
  
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.selectedImagePreview = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error = 'Selecciona un archivo de imagen válido.';
      this.selectedImagePreview = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      this.selectedImagePreview = result;
      this.error = '';
    };
    reader.onerror = () => {
      this.error = 'No se pudo leer la imagen seleccionada.';
      this.selectedImagePreview = '';
    };

    reader.readAsDataURL(file);
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const q = query(
        collection(this.firestore, 'Usuarios'),
        where('username', '==', username.toLowerCase().trim())
      );
      const snapshot = await getDocs(q);
      return snapshot.empty; // Retorna true si no existen documentos con ese username
    } catch (error) {
      console.error('Error al verificar username:', error);
      return false; // Si hay error, asumimos que no está disponible
    }
  }

  async register(){
    try{
      // Validar que el username no esté vacío
      if (!this.registerInfo.username.trim()) {
        this.error = 'Por favor ingresa un nombre de usuario.';
        return;
      }

      // Validar que el username sea único
      const usernameAvailable = await this.isUsernameAvailable(this.registerInfo.username);
      if (!usernameAvailable) {
        this.error = 'Este nombre de usuario ya está en uso. Elige otro.';
        return;
      }

      // Normalizar el username a minúsculas
      this.registerInfo.username = this.registerInfo.username.toLowerCase().trim();

      const user = await this.auth.register(this.registerInfo.email,this.registerInfo.password);

      this.registerInfo.avatar = this.selectedImagePreview || 'assets/avatar-default.jpeg';

      await setDoc(doc(this.firestore,"Usuarios", user.uid),this.registerInfo);
      
      // Crear la lista Watchlist predeterminada para el nuevo usuario
      const watchlist: Omit<List, 'id'> = {
        userId: user.uid,
        name: 'Watchlist',
        movieIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false
      };

      await addDoc(collection(this.firestore,"Lists"), watchlist);

      console.log("Usuario registrado exitosamente");
      console.log("UID:", user.uid);
      console.log("Username:", this.registerInfo.username);
      console.log("Watchlist creada sin películas");

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
