import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, getDocs, limit, query, where } from '@angular/fire/firestore';
import { AiAssistantService, AiRecommendation, MovieBrief } from '../services/ai-assistant.service';

interface MovieDoc {
  id: string;
  title: string;
  genres?: string;
  overview?: string;
  keywords?: string;
  poster_path?: string;
  release_date?: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css'
})
export class AiAssistantComponent {
  searchA = '';
  searchB = '';
  resultsA: MovieDoc[] = [];
  resultsB: MovieDoc[] = [];
  selectedA?: MovieDoc;
  selectedB?: MovieDoc;
  recommendations: AiRecommendation[] = [];
  loading = false;
  error = '';

  constructor(private firestore: Firestore, private ai: AiAssistantService) {}

  async search(term: string, target: 'A' | 'B') {
    if (!term || term.trim().length < 2) {
      this.assignResults(target, []);
      return;
    }

    const col = collection(this.firestore, 'Peliculas');
    const q = query(
      col,
      where('title', '>=', term),
      where('title', '<=', term + '\uf8ff'),
      limit(8)
    );

    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as MovieDoc[];
    this.assignResults(target, items);
  }

  select(movie: MovieDoc, target: 'A' | 'B') {
    if (target === 'A') {
      this.selectedA = movie;
      this.searchA = movie.title;
      this.resultsA = [];
    } else {
      this.selectedB = movie;
      this.searchB = movie.title;
      this.resultsB = [];
    }
  }

  clear(target: 'A' | 'B') {
    if (target === 'A') {
      this.selectedA = undefined;
      this.searchA = '';
      this.resultsA = [];
    } else {
      this.selectedB = undefined;
      this.searchB = '';
      this.resultsB = [];
    }
    this.recommendations = [];
  }

  async generate() {
    this.error = '';
    this.recommendations = [];

    if (!this.selectedA || !this.selectedB) {
      this.error = 'Selecciona dos películas para generar ideas.';
      return;
    }

    this.loading = true;
    try {
      const briefA = this.toBrief(this.selectedA);
      const briefB = this.toBrief(this.selectedB);
      this.recommendations = await this.ai.getRecommendations(briefA, briefB);
    } catch (err) {
      console.error(err);
      this.error = 'No pudimos generar recomendaciones ahora. Inténtalo de nuevo en unos minutos.';
    } finally {
      this.loading = false;
    }
  }

  getPosterUrl(posterPath?: string, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342'): string {
    if (!posterPath) return '/assets/placeholder-poster.jpg';
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  }

  private toBrief(movie: MovieDoc): MovieBrief {
    return {
      title: movie.title,
      genres: movie.genres,
      overview: movie.overview?.slice(0, 500),
      keywords: movie.keywords,
    };
  }

  private assignResults(target: 'A' | 'B', items: MovieDoc[]) {
    if (target === 'A') {
      this.resultsA = items;
    } else {
      this.resultsB = items;
    }
  }
}
