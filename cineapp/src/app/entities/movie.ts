export interface Genero {
    id: number;
    nombre: string;
    rol: rol;
  }

export enum rol{
    ACTOR = 'actor',
    DIRECTOR = 'director',
    TECNICO = 'tecnico'
  }
export interface Person {
    id: number;
    nombre: string;
    fotoPath?: string;
    personaje?: string; // Solo para actores
  }

export interface Review {
    id: string;
    usuarioId: string;
    contenido: string;
    rating: number;
    fecha: Date;
    likes: number;
  }

export interface Movie {
    id: string;
    titulo: string;
    tituloOriginal?: string;
    posterPath: string; // URL o path a la imagen
    backdropPath?: string; // Imagen de fondo
    overview: string;
    fechaEstreno: Date | string;
    duracion: number; // en minutos
    rating: number; // 0-10
    generos: Genero[];
    director: Person;
    actores: Person[];
    reseñas: Review[];
    presupuesto?: number;
    ingresos?: number;
    sitioWeb?: string;
    estado?: 'En producción' | 'Estrenada' | 'Cancelada';
    esFavorita?: boolean;
    tags?: string[];
  }