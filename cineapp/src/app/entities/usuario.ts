export interface Usuario {
  id: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  email: string;
  password: string;
  administrador: boolean;
  fecha_registro: Date;
  avatar?: string;
  entrenador: boolean;
  amigos?: string[];
  isOnline?: boolean;
}

export class UsuarioImpl implements Usuario {
  id: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  email: string;
  password: string;
  fecha_registro: Date;
  administrador: boolean;
  entrenador: boolean;
  avatar?: string;
  amigos?: string[];
  isOnline?: boolean;
  
  constructor() {
    this.id = 0;
    this.nombre = '';
    this.apellido1 = '';
    this.apellido2 = '';
    this.email = '';
    this.password = '';
    this.fecha_registro = new Date();
    this.administrador = false;
    this.entrenador = false;
  }
}