import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListsService } from '../services/lists.service';
import { addDoc, Firestore, collection, getDocs, query, where, doc, updateDoc, arrayUnion, orderBy, limit } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { Location } from '@angular/common';
import { ActionType } from '../entities/actions';
import { user } from 'firebase-functions/v1/auth';
@Component({
  selector: 'app-search-films',
  standalone: true,
  imports:  [CommonModule, FormsModule],
  templateUrl: './search-films.component.html',
  styleUrl: './search-films.component.css'
})
export class SearchFilmsComponent {

  showModal = false;
  userLists: any[] = []; // listas del usuario
  selectedMovie: any = null;
  titulo: string = "";
  results: any[]=[];
  successMessage: string = "";
  // UI-ready list for the "Ultimas busquedas" panel.
  // You can populate this from Actions collection with the latest 5 items.
  recentSearches: Array<{ id: string; title: string; poster_path?: string; searchedAt?: Date }> = [];
  
  constructor(private firestore: Firestore, private router: Router, private listservice: ListsService, 
    private auth: AuthService, private loc:Location) {}

  get showRecentSearchesPanel(): boolean {
    return !this.titulo.trim() && this.results.length === 0 && this.recentSearches.length > 0;
  }
  
  ngOnInit() {
      this.loadRecentSearches();
  }

  async loadRecentSearches(){
    const userId = this.auth.getCurrentUser()?.uid;
    if(!userId) {
      this.recentSearches = [];
      return;
    }

    const colRef = collection(this.firestore, "Actions");
    const q = query(
      colRef,
      where("userId", "==", userId),
      where("type", "==", ActionType.Search),
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const snap = await getDocs(q);
    const mapped = snap.docs
      .map(docSnap => {
        const data: any = docSnap.data();
        const titleFromMessage = (data['extraMessage'] ?? '').toString().replace('Has buscado esta película recientemente: ', '').trim();
        return {
          id: data['movieId'],
          title: titleFromMessage || 'Pelicula',
          poster_path: data['poster_path'],
          searchedAt: data['createdAt']?.toDate?.()
        };
      })
      .filter(item => !!item.id);

    const uniqueByMovie = new Map<string, typeof mapped[number]>();
    for (const item of mapped) {
      if (!uniqueByMovie.has(item.id)) {
        uniqueByMovie.set(item.id, item);
      }
    }

    const topRecent = Array.from(uniqueByMovie.values()).slice(0, 5);

    const completedRecent = await Promise.all(
      topRecent.map(async (item) => {
        if (item.poster_path) {
          return item;
        }

        const peliculasRef = collection(this.firestore, "Peliculas");
        const movieQuery = query(peliculasRef, where("id", "==", item.id), limit(1));
        const movieSnap = await getDocs(movieQuery);
        if (movieSnap.empty) {
          return item;
        }

        const movieData: any = movieSnap.docs[0].data();
        return {
          ...item,
          title: item.title || movieData['title'] || 'Pelicula',
          poster_path: movieData['poster_path'] || item.poster_path
        };
      })
    );

    this.recentSearches = completedRecent;
  }
  async search(){

    if (!this.titulo.trim()) {
      this.results = [];
      return;
    }

    const searchTerm = this.titulo.trim().toLowerCase();
    const docref = collection(this.firestore, "Peliculas");
    const querySnapshot = await getDocs(docref);

    this.results = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((movie: any) => {
        const title = (movie.title ?? '').toString().toLowerCase();
        return title.includes(searchTerm);
      });

  }

  closeSearch() {
    this.loc.back();
    // this.router.navigate(['/inicio']); // Ajustá la ruta según a dónde quieras volver
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
  async goToDetail(id: string) {
    if(id!=null){
      const userId = this.auth.getCurrentUser()?.uid ?? 'unknown';
      const collectionRefPeliculas = collection(this.firestore, "Peliculas");
      const q = query(collectionRefPeliculas, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      const movieData: any = querySnapshot.docs.length > 0 ? querySnapshot.docs[0].data() : null;
      this.titulo = movieData?.['title'] ?? 'Unknown';
      const posterPath = movieData?.['poster_path'] ?? null;

      const collectionRefActions = collection(this.firestore, "Actions");
      const existingActionQuery = query(
        collectionRefActions,
        where("userId", "==", userId),
        where("type", "==", ActionType.Search),
        where("movieId", "==", id),
        limit(1)
      );

      const existingActionDocs = await getDocs(existingActionQuery);
      if (existingActionDocs.empty) {
        await addDoc(collectionRefActions,{
          type: ActionType.Search,
          createdAt: new Date(),
          extraMessage: `Has buscado esta película recientemente: ${this.titulo}`,
          movieId: id,
          poster_path: posterPath,
          userId
        });
      } else {
        await updateDoc(existingActionDocs.docs[0].ref, {
          createdAt: new Date(),
          extraMessage: `Has buscado esta película recientemente: ${this.titulo}`,
          poster_path: posterPath
        });
      }

      await this.loadRecentSearches();
    }
    this.router.navigate(['/movie', id]);
  }


  async openAddToList(movie: any, event: MouseEvent) {
  // event.stopPropagation(); // evita que se ejecute goToDetail
  this.selectedMovie = movie;
  this.showModal = true;

  // TODO: cargar listas del usuario desde Firestore
  const userId = this.auth.getCurrentUser()?.uid;
  if(userId != null)
    this.userLists = await this.listservice.getUserLists(userId);
  else
    this.closeModal();
}

  

  closeModal() {
    this.showModal = false;
    this.selectedMovie = null;
  }

  async addMovieToList(movieId: string, listId: string) {
    console.log(`Añadiendo película ${movieId} a lista ${listId}`);

    const docRefList = doc(this.firestore,"Lists",listId);
    const docRefAction = collection(this.firestore, "Actions");
    const updateList = await updateDoc(docRefList,
      {
        "movieIds": arrayUnion(movieId)
      }
    );
    await addDoc(docRefAction, {
      type: ActionType.AddToList,
      userId: this.auth.getCurrentUser()?.uid ?? 'unknown',
      movieId: movieId,
      extraInfo: `Has añadido ${this.selectedMovie?.title ?? 'la película'} a la lista ${this.userLists.find(l => l.id === listId)?.name ?? 'desconocida'}`,
      createdAt: new Date(),
    });

    this.successMessage = "✅ Successfully updated list :)";
    setTimeout(() => {
      this.successMessage = "";
    }, 3000);
    this.closeModal();
  }

  

}
