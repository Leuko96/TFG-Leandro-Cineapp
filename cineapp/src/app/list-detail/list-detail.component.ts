import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc, updateDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-detail',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './list-detail.component.html',
  styleUrl: './list-detail.component.css'
})
export class ListDetailComponent implements OnInit{
  listId!: string;
  list: any;
  movies: any[] = []; // películas actuales en la lista
  searchQuery: string = '';
  searchResults: any[] = [];

  readonly TMDB_BASE = 'https://image.tmdb.org/t/p/w500';

  constructor(private route: ActivatedRoute, private firestore: Firestore) {}

  async ngOnInit() {
    this.listId = this.route.snapshot.paramMap.get('id')!;
    await this.loadList();
  }

  async loadList() {
    const listRef = doc(this.firestore, 'Lists', this.listId);
    const snap = await getDoc(listRef);
    if (snap.exists()) {
      this.list = { id: snap.id, ...snap.data() };
      await this.loadMovies();
    }
  }

  async loadMovies() {
    if (!this.list?.movieIds?.length) {
      this.movies = [];
      return;
    }

    const moviesRef = collection(this.firestore, 'Peliculas');
    const q = query(moviesRef, where('__name__', 'in', this.list.movieIds.slice(0, 10))); 
    const snap = await getDocs(q);

    this.movies = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async searchMovies() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    const moviesRef = collection(this.firestore, 'Peliculas');
    const q = query(moviesRef, where('title', '>=', this.searchQuery), where('title', '<=', this.searchQuery + '\uf8ff'));
    const snap = await getDocs(q);

    this.searchResults = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async addToList(movieId: string) {
    if (this.list.movieIds.includes(movieId)) return; // evitar duplicados

    this.list.movieIds.push(movieId);

    const listRef = doc(this.firestore, 'Lists', this.listId);
    await updateDoc(listRef, { movieIds: this.list.movieIds, updatedAt: new Date() });

    await this.loadMovies();
  }

  getPoster(path: string) {
    return path ? `${this.TMDB_BASE}${path}` : '/assets/placeholder-poster.jpg';
  }
}
