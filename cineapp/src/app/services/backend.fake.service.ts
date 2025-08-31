import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Usuario } from "../entities/usuario";
import { SECRET_JWT } from "../config/config";
import { from } from "rxjs";
import * as jose from 'jose';
import { FRONTEND_URI } from "../config/config";
// import { Evento } from "../calendario/evento.model";
// import { Hueco } from "../calendario/hueco.model";

// Este servicio imita al backend pero utiliza localStorage para almacenar los datos
let now: Date = new Date();
const year = now.getFullYear();   
const month = now.getMonth();
const day =  now.getDate(); 

const usuariosC: Usuario [] = [
  {
    id: 1,
    nombre: 'Leandro',
    apellido1: 'Martin',
    apellido2: 'Calvo',
    email: 'admin@uma.es',
    administrador: true,
    avatar:'./image.png',
    fecha_registro: new Date(year, month, day),  
    password: 'admin',
    entrenador: true,
  },
  {
    id: 2,
    nombre: 'Antonio',
    apellido1: 'García',
    apellido2: 'Ramos',
    email: 'antonio@uma.es',
    administrador: false,
    fecha_registro: new Date(year, month, day),
    password: '5678',
    entrenador: false,
  },
];

@Injectable({
  providedIn: 'root'
})
export class BackendFakeService {
  private usuarios: Usuario [];
  private forgottenPasswordTokens;

  constructor() {
    let _usuarios = localStorage.getItem('usuarios');
    if (_usuarios) {
      this.usuarios = JSON.parse(_usuarios);
    } else {
      this.usuarios = [...usuariosC];
    }

    let _forgottenPasswordTokens = localStorage.getItem('forgottenPasswordTokens');
    if (_forgottenPasswordTokens) {
      this.forgottenPasswordTokens = new Map(JSON.parse(_forgottenPasswordTokens));
    } else {
      this.forgottenPasswordTokens = new Map();
    }
    
}

  getUsuarios(): Observable<Usuario[]> {
    return of(this.usuarios);
  }

  postUsuario(usuario: Usuario): Observable<Usuario> {
    let u = this.usuarios.find(u => u.email == usuario.email);
    if (!usuario.email) {
      return new Observable<Usuario>(observer => {
        observer.error('El email es obligatorio');
      });
    }
    if (u) {
      return new Observable<Usuario>(observer => {
        observer.error('El usuario ya existe');
      });
    }
    // Si no trae contraseña generamos una aleatoria
    if (usuario.password.length == 0) {
      usuario.password = this.generarCadena();
    }

    usuario.id = this.usuarios.map(u => u.id).reduce((a, b) => Math.max(a, b)) + 1;
    this.usuarios.push(usuario);
    this.guardarUsuariosEnLocalStorage();
    return of(usuario);
  }

  private guardarUsuariosEnLocalStorage() {
    localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
  }

  private guardarForgottenPasswordTokensEnLocalStorage() {
    localStorage.setItem('forgottenPasswordTokens', JSON.stringify(Array.from(this.forgottenPasswordTokens.entries())));
  }

  putUsuario(usuario: Usuario): Observable<Usuario> {
    let u = this.usuarios.find(u => u.id == usuario.id);
    if (!u) {
      return new Observable<Usuario>(observer => {
        observer.error('El usuario no existe');
      });
    }
    // Si la contraseña está en blanco mantenemos la que ya tiene
    if (usuario.password.length == 0) {
      usuario.password = u.password;
    }

    Object.assign(u, usuario);
    this.guardarUsuariosEnLocalStorage();
    return of(u);
  }

  deleteUsuario(id: number): Observable<void> {
    let i = this.usuarios.findIndex(u => u.id == id);
    if (i < 0) {
      return new Observable<void>(observer => {
        observer.error('El usuario no existe');
      });
    }
    this.usuarios.splice(i, 1);
    this.guardarUsuariosEnLocalStorage();
    return of();
  }

  getUsuario(id: number): Observable<Usuario> {
    let u = this.usuarios.find(u => u.id == id);
    if (!u) {
      return new Observable<Usuario>(observer => {
        observer.error('El usuario no existe');
      });
    }
    return of(u);
  }

  login(email: string, password: string): Observable<string> {
    let u = this.usuarios.find(u => u.email == email && u.password == password);
    if (!u) {
      return new Observable<string>(observer => {
        observer.error({status: 401, statusText: 'Usuario o contraseña incorrectos'});
      });
    }
    return from(this.generateJwt(u));
  }

  forgottenPassword(email: string): Observable<void> {
    const token = this.generarCadena()
    console.log('Para resetar la contraseña acceda a: '+FRONTEND_URI+'/reset-password?token='+token);
    this.forgottenPasswordTokens.set(token, email);
    this.guardarForgottenPasswordTokensEnLocalStorage();
    return of();
  }

  resetPassword(token: string, password: string): Observable<void> {
    if (!this.forgottenPasswordTokens.get(token)) {
      return new Observable<void>(observer => {
        observer.error('Token incorrecto');
      });
    }
    let email = this.forgottenPasswordTokens.get(token);
    console.log("Email for token: ", email)
    let u = this.usuarios.find(u => u.email == email);
    if (!u) {
      return new Observable<void>(observer => {
        observer.error('Usuario no existe');
      });
    }
    u.password = password;
    this.forgottenPasswordTokens.delete(token);

    this.guardarUsuariosEnLocalStorage();
    this.guardarForgottenPasswordTokensEnLocalStorage();
    return of();
  }

  private generateJwt(usuario: Usuario): Promise<string> {
    const secret = new TextEncoder().encode(SECRET_JWT);
    return new jose.SignJWT({ sub: ""+usuario.id, email: usuario.email })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret);
  }

  private generarCadena(): string {
    return Math.random().toString(36).substring(2);
  }
  // getEventos(): Observable<Evento[]> {
  //   return of(this.eventos);
  // }

  // agregarEvento(evento: Evento): Observable<Evento> {
  //   evento.id = this.eventos.length + 1;
  //   this.eventos.push(evento);
  //   this.guardarEventosEnLocalStorage();
  //   return of(evento);
  // }
  
  // agregarHueco(hueco: Hueco): Observable<Hueco> {
  //   this.huecos.push(hueco);
  //   this.guardarHuecosEnLocalStorage();
  //   return of(hueco);
  // }

  // editarEvento(evento: Evento): Observable<Evento> {
  //   let index = this.eventos.findIndex(e => e.id === evento.id);
  //   if (index !== -1) {
  //     this.eventos[index] = evento;
  //     this.guardarEventosEnLocalStorage();
  //     return of(evento);
  //   } else {
  //     return new Observable<Evento>(observer => {
  //       observer.error('Evento no encontrado');
  //     });
  //   }
  // }

  // eliminarEvento(id: number): Observable<void> {
  //   let index = this.eventos.findIndex(e => e.id === id);
  //   if (index !== -1) {
  //     this.eventos.splice(index, 1);
  //     this.guardarEventosEnLocalStorage();
  //     return of();
  //   } else {
  //     return new Observable<void>(observer => {
  //       observer.error('Evento no encontrado');
  //     });
  //   }
  // }

  // private guardarEventosEnLocalStorage() {
  //   localStorage.setItem('eventos', JSON.stringify(this.eventos));
  // }
  // private guardarHuecosEnLocalStorage() {
  //   localStorage.setItem('huecos', JSON.stringify(this.huecos));
  // }
  
}
