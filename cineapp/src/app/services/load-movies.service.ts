import { Component } from '@angular/core';
import { MovieService } from './movie.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-load-movies',
  standalone: true,
  imports:[CommonModule],
  template: `
    <div>
      <button (click)="cargarDataset()">🚀 Cargar Dataset en Firestore</button>
      <p>{{status}}</p>
    </div>
  `
})
export class LoadMoviesService {
  status = "Esperando";
  constructor(private movieService: MovieService) { }

  async cargarDataset(){
    this.status = "Cargando dataset";
    let offset = 0;
    const batchSize = 500;
    const total = 5000;

    while(offset < total){
      this.status = `Cargando películas desde ${offset} a ${offset + batchSize}...`;
      console.log(this.status);

      const movies = await this.movieService.getMovies(offset,batchSize);

      for(let movie of movies){
        await this.movieService.saveMovie(movie);
      }

      offset += batchSize;
    }
    this.status = "✅ Dataset cargado en Firestore";
    
  }
}
