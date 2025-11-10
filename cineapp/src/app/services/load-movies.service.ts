import { Component } from '@angular/core';
import { MovieService } from './movie.service';
import { CommonModule } from '@angular/common';
import { collection, Firestore, getDocs, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-load-movies',
  standalone: true,
  imports:[CommonModule],
  template: `
    <div>
      <button (click)="meterID()">🆔 Agregar campo 'id' a todos los usuarios</button>
      <p>{{idStatus}}</p>
      <button (click)="cargarDataset()">🚀 Cargar Dataset en Firestore</button>
      <p>{{status}}</p>
      
    </div>
  `
})
export class LoadMoviesService {
  status = "Esperando";
  idStatus = "Esperando";
  constructor(private movieService: MovieService, private firestore: Firestore) { }

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

   async meterID() {
    this.idStatus = "🔄 Añadiendo campo 'id' a todos los usuarios...";
    const usuariosRef = collection(this.firestore, 'Usuarios');
    const snapshot = await getDocs(usuariosRef);

    let count = 0;
    for (const docSnap of snapshot.docs) {
      const userId = docSnap.id;
      const userRef = doc(this.firestore, 'Usuarios', userId);
      await updateDoc(userRef, { Amigos: [],id: userId });
      count++;
    }

    this.idStatus = `✅ Campo 'id' añadido a ${count} usuarios`;
    console.log(this.idStatus);
  }
}
