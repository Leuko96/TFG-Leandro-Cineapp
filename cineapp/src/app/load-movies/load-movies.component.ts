import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-load-movies',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './load-movies.component.html',
  styleUrl: './load-movies.component.css'
})
export class LoadMoviesComponent {
  status = "Esperando";
  constructor(private movieService: MovieService) {}

  async cargarDataset(){
    this.status = "Cargando dataset";
    let offset = 0;
    const batchSize = 100;
    const total = 5000;

    while (offset < total){
      this.status = `Cargando películas desde ${offset} a ${offset + batchSize}...`;
      console.log(this.status);

      const movies = await this.movieService.getMovies(offset,batchSize);

      for(let movie of movies){
        
        await this.movieService.saveMovie(movie);
      }
      // await this.movieService.saveMovie(movies);
      offset += batchSize;
      // offset = total;
    }
    this.status = "✅ Dataset cargado en Firestore";
    
  }

  change_id(){
    this.movieService.change_id();
  }
}
