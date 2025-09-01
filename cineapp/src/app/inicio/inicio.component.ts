import { Component } from '@angular/core';
import { Usuario, UsuarioImpl } from '../entities/usuario';
import { UsuariosService } from '../services/usuarios.service';
import { FirebaseService } from '../services/firebase.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { doc, getDoc , Firestore} from '@angular/fire/firestore';
import { user } from '@angular/fire/auth';

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
  nombre: string = "";
  apellido1: string = "";
  apellido2: string = "";
  fecharegistro: Date = new Date();
  email: string = "a";

  
  constructor(private usuarioService: UsuariosService, private auth: AuthService, private firestore : Firestore) {
    
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
    }

  async ngOnInit() {
    // const usuarios = await this.fbService.getUsuarios();
    // console.log("Usuarios Firestore:", usuarios);
    const user = this.auth.getCurrentUser();
    if(user){
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
  
  // getActualDocument = async () =>{  
  //   try{
  //     const db = getFirestore();
  //     const user = this.auth.getCurrentUser();
  //     if (!user) {
  //       throw new Error('No authenticated user');
  //     }

  //     const docRef = doc(db,"Usuarios",user.uid);
  //     const userDoc = await getDoc(docRef);

  //     if (userDoc.exists()) {
  //       console.log('Documento del usuario:', userDoc.data());

  //       return {
  //         id: userDoc.id,
  //         ...userDoc.data()
  //       };
  //     }else{
  //       return null;
  //     }
    

  //   }catch(error){
  //     console.log('Error al obtener el documento:' + error);
  //     throw error;
  //   }
  // }


  // get logo(){
  //   return this.usuarioSesion?.avatar;
  // }
  
}
