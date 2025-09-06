import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Movie } from '../entities/movie';

import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';

@Component({
  selector: 'app-search-films',
  standalone: true,
  imports:  [CommonModule, FormsModule],
  templateUrl: './search-films.component.html',
  styleUrl: './search-films.component.css'
})
export class SearchFilmsComponent {

  titulo: string = "";
  results: any[]=[];
  constructor(private firestore: Firestore, private router: Router) {}

  async search(){

    if (!this.titulo.trim()) {
      this.results = [];
      return;
    }

    const docref = collection(this.firestore,"Peliculas");
    const arr = this.separateTitle(this.titulo);
    console.log(arr);
    const q = query(docref, where("title", ">=", this.titulo),
    where("title", "<=", this.titulo + '\uf8ff'));
    
    const querySnapshot = await getDocs(q);

    this.results = querySnapshot.docs.map(doc => ({
      id: doc.id,        // guardamos el id del doc
      ...doc.data()      // "spread": todos los campos del documento
    }));
    // this.results = querySnapshot.docs.map(doc => ({
    //     id: doc.id,
    //     title: doc.title,
    //     genres: doc.genres,
    //     original_language: row.original_language, // URL o path a la imagen
    //     overview: row.overview, // Imagen de fondo
    //     popularity: row.popularity,
    //     production_companies: row.production_companies,
    //     release_date: row.release_date,
    //     budget: row.budget,
    //     revenue: row.revenue,
    //     runtime: row.runtime,
    //     status: row.status,
    //     tagline: row.tagline,
    //     vote_average: row.vote_average,
    //     vote_count: row.vote_count,
    //     credits: row.credits,
    //     keywords: row.keywords,
    //     poster_path:row.poster_path,
    //     backdrop_path: row.backdrop_path,
    //     recommendations: row.recommendations
    // }));

  }
  // query: string = '';
  // results: { title: string; year: string; poster?: string }[] = [];
  
  // constructor(private router: Router) {}

  // search() {
  //   // Simulación de resultados de búsqueda
  //   if (this.query.trim()) {
  //     this.results = [
  //       { title: 'The Godfather', year: '1972', poster: 'assets/godfather.jpg' },
  //       { title: 'Pulp Fiction', year: '1994', poster: 'assets/pulpfiction.jpg' },
  //       { title: 'Interstellar', year: '2014', poster: 'assets/interstellar.jpg' }
  //     ].filter(movie => movie.title.toLowerCase().includes(this.query.toLowerCase()));
  //   } else {
  //     this.results = [];
  //   }
  // }
  closeSearch() {
    this.router.navigate(['/inicio']); // Ajustá la ruta según a dónde quieras volver
  }

  separateTitle(titulo: string): string []{
    if(!titulo || titulo.length ===0){
      return [];
    }
    const resultado: string[] = [];
    for(let i = 1; i <= titulo.length; i++){
      resultado.push(titulo.substring(0,i));
    }
    return resultado;
  }
    readonly TMDB_BASE = 'https://image.tmdb.org/t/p/';

  getPosterUrl(posterPath: string, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!posterPath) return '/assets/placeholder-poster.jpg';
    return `${this.TMDB_BASE}${size}${posterPath}`;
  }
  goToDetail(id: string) {
    this.router.navigate(['/movie', id]);
  }
}
