import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc, updateDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Movie } from '../entities/movie';
import { Router } from '@angular/router';

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
  isEditing = false;
  editList: any = { name: '', description: '', isPublic: false };

  readonly TMDB_BASE = 'https://image.tmdb.org/t/p/w500';

  constructor(private route: ActivatedRoute, private firestore: Firestore, private router: Router) {}

  async ngOnInit() {
    this.listId = this.route.snapshot.paramMap.get('id')?.toString()!;
    // const listRef = doc(this.firestore, 'Lists', this.listId);
    // await updateDoc(listRef,{movieIds:[774372]});
    await this.loadList();
  }

  async loadList() {
    const listRef = doc(this.firestore, 'Lists', this.listId);
    const snap = await getDoc(listRef);
    
    if (snap.exists()) {
      
      this.list = { id: snap.id, ...snap.data() };
      console.log(this.list);
      await this.loadMovies();
    }
  }

  async loadMovies() {
    this.movies = this.list["movieIds"];
    if (this.movies.length==0) {
      this.movies = [];
      return;
    }

    const moviesRef = collection(this.firestore, 'Peliculas');
    const q = query(moviesRef, where('id', 'in', this.movies)); 
    const snap = await getDocs(q);

    this.movies = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(this.movies[0]);

  }

  async searchMovies() {
    this.router.navigate(["search-films"]);
    // if (!this.searchQuery.trim()) {
    //   this.searchResults = [];
    //   return;
    // }

    // const moviesRef = collection(this.firestore, 'Peliculas');
    // const q = query(moviesRef, where('title', '>=', this.searchQuery), where('title', '<=', this.searchQuery + '\uf8ff'));
    // const snap = await getDocs(q);

    // this.searchResults = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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

  async onRemove(movie:Movie){
    const movies_list = this.list["movieIds"];
    console.log(movies_list);
    for(let i = 0; i<movies_list.length;i++){
      if(movies_list[i]==movie.id){
        
        console.log(true);
        movies_list.splice(i,1);
      }
    }
    console.log(movies_list);

    const listRef = doc(this.firestore, 'Lists', this.listId.toString());
    await updateDoc(listRef, { "movieIds": movies_list, "updatedAt": new Date() });
    await this.loadMovies();
  }

  openEdit() {
    this.editList = { ...this.list }; // copiar datos actuales
    this.isEditing = true;
  }

  closeEdit() {
    this.isEditing = false;
  }

  async updateList() {
    
    console.log("Guardando cambios:", this.editList);

    const listRef = doc(this.firestore, 'Lists', this.listId.toString());
    await updateDoc(listRef, { "name": this.editList.name, "description": this.editList.description, "isPublic":this.editList.isPublic,"updatedAt": new Date() });
    await this.loadList();

    this.isEditing = false;
  }
}
