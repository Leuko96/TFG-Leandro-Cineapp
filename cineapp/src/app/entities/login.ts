
export interface Login {
  email: string;
  password: string;
}

export interface Register {
  name: string;
  surname1: string;
  surname2: string;
  email: string;
  password: string;
  favourite_film:string;
}

export interface JwtResponse {
  jwt: string;
}

export enum Rol {
  ADMINISTRADOR = 'administrador',
  CLIENTE = 'cliente'
}

// export interface RolCentro {
//   rol: Rol;
//   centro?: number;
//   nombreCentro?: string;
// }

export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  email: string;
  fecha_registro: Date;
  avatar?: string;
  jwt: string;
}

export type MapaCentros = Map<number, string>;


