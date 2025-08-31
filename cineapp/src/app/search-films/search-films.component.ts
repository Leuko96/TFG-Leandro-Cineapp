import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-films',
  standalone: true,
  imports:  [CommonModule, FormsModule],
  templateUrl: './search-films.component.html',
  styleUrl: './search-films.component.css'
})
export class SearchFilmsComponent {
  

  query: string = '';
  results: { title: string; year: string; poster?: string }[] = [];
  
  constructor(private router: Router) {}

  search() {
    // Simulación de resultados de búsqueda
    if (this.query.trim()) {
      this.results = [
        { title: 'The Godfather', year: '1972', poster: 'assets/godfather.jpg' },
        { title: 'Pulp Fiction', year: '1994', poster: 'assets/pulpfiction.jpg' },
        { title: 'Interstellar', year: '2014', poster: 'assets/interstellar.jpg' }
      ].filter(movie => movie.title.toLowerCase().includes(this.query.toLowerCase()));
    } else {
      this.results = [];
    }
  }
  closeSearch() {
    this.router.navigate(['/inicio']); // Ajustá la ruta según a dónde quieras volver
  }
}
