import { Component } from '@angular/core';
import { Usuario, UsuarioImpl } from '../entities/usuario';
import { UsuariosService } from '../services/usuarios.service';
import { FirebaseService } from '../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

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
  
  constructor(private usuarioService: UsuariosService, private fbService: FirebaseService) {
    this.nombre = this.usuarioSesion?.nombre ?? "null";
    this. apellido1 = this.usuarioSesion?.apellido1 ?? "null";
    this. apellido2 = this.usuarioSesion?.apellido1 ?? "null";
    this.fecharegistro = this.usuarioSesion?.fecha_registro?? new Date(0,0,0);
    // this.actualizarRol();
    
  }

  async ngOnInit() {
    const usuarios = await this.fbService.getUsuarios();
    console.log("Usuarios Firestore:", usuarios);
  }
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
  
  get usuarioSesion() {
    return this.usuarioService.getUsuarioSesion();
  }



  get logo(){
    return this.usuarioSesion?.avatar;
  }
  
}
