
export interface Login {
  email: string;
  password: string;
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
  jwt: string;
}

export type MapaCentros = Map<number, string>;


