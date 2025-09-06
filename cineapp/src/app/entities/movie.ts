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
    id: number;
    title: string;
    genres: string;
    original_language: string; // URL o path a la imagen
    overview: string; // Imagen de fondo
    // popularity: Float64Array;
    popularity: number;
    production_companies: string;
    release_date: Date | string;
    // budget: Float64Array;
    budget: number;
    // revenue: Float64Array;
    // runtime: Float64Array;
    revenue: number;
    runtime: number;
    status: string;
    tagline: string;
    // vote_average: Float64Array;
    vote_average: number;
    // vote_count: Float64Array;
    vote_count: number;
    credits: string;
    keywords: string;
    poster_path:string;
    backdrop_path: string;
    recommendations: string;

    
  }

  export class MovieImp implements Movie{
    id: number;
    title: string;
    genres: string;
    original_language: string; // URL o path a la imagen
    overview: string; // Imagen de fondo
    // popularity: Float64Array;
    popularity: number;
    production_companies: string;
    release_date: Date | string;
    // budget: Float64Array;
    budget: number;
    // revenue: Float64Array;
    // runtime: Float64Array;
    revenue: number;
    runtime: number;
    status: string;
    tagline: string;
    // vote_average: Float64Array;
    vote_average: number;
    // vote_count: Float64Array;
    vote_count: number;
    credits: string;
    keywords: string;
    poster_path:string;
    backdrop_path: string;
    recommendations: string;
      constructor(){
        this.id = 0;
        this.title = " ";
        this.genres = "";
        this.original_language = ""; // URL o path a la imagen
        this.overview = ""; // Imagen de fondo
        // popularity: Float64Array;
        this.popularity= 0;
        this.production_companies= "";
        this.release_date= "";
        // budget: Float64Array;
        this.budget=0;
        // revenue: Float64Array;
        // runtime: Float64Array;
        this.revenue=0;
        this.runtime=0;
        this.status="";
        this.tagline="";
        // vote_average: Float64Array;
        this.vote_average=0;
        // vote_count: Float64Array;
        this.vote_count=0;
        this.credits="";
        this.keywords="";
        this.poster_path="";
        this.backdrop_path="";
        this.recommendations="";
      }
    }