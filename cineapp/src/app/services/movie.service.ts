import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Firestore, collection, addDoc, doc, setDoc, query, getDocs, deleteDoc} from "@angular/fire/firestore"
import { Movie } from '../entities/movie';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  // private apiURL = "https://datasets-server.huggingface.co/rows?dataset=wykonos%2Fmovies&config=default&split=train&offset=0&length=100";
  private apiURL = "https://datasets-server.huggingface.co/rows?dataset=wykonos%2Fmovies&config=default&split=train"; 
  constructor(private firestore: Firestore, private http: HttpClient) { }

   async getMovies(offset: number, length: number = 100): Promise<Movie[]> {
    const url = `${this.apiURL}&offset=${offset}&length=${length}`;
    const res: any = await firstValueFrom(this.http.get(url));
    // const res: any = await this.http.get(`${this.apiURL}`);
    if (!res || !res.rows) {
      console.warn("⚠️ Respuesta inesperada de la API:", res);
      return [];
    }
    console.log(url);
    return res.rows.map((r:any) => {
      const row = r.row;
      return {
        id: row.id,
        title: row.title,
        genres: row.genres,
        original_language: row.original_language, // URL o path a la imagen
        overview: row.overview, // Imagen de fondo
        popularity: row.popularity,
        production_companies: row.production_companies,
        release_date: row.release_date,
        budget: row.budget,
        revenue: row.revenue,
        runtime: row.runtime,
        status: row.status,
        tagline: row.tagline,
        vote_average: row.vote_average,
        vote_count: row.vote_count,
        credits: row.credits,
        keywords: row.keywords,
        poster_path:row.poster_path,
        backdrop_path: row.backdrop_path,
        recommendations: row.recommendations
      } as Movie
    });
  }

  async saveMovie(movie: Movie) {
    try {
      const colRef = collection(this.firestore, 'Peliculas');
      await addDoc(colRef, {
        // titulo: movie.title,  
        // generos: movie.genres,
        // director: movie.Director,
        // año: movie.Year,
        // puntuacion: movie.Rating,
        // fecha_subida: new Date()
        id: movie.id,
        title: movie.title,
        genres: movie.genres,
        original_language: movie.original_language, // URL o path a la imagen
        overview: movie.overview, // Imagen de fondo
        popularity: movie.popularity,
        production_companies: movie.production_companies,
        release_date: movie.release_date,
        budget: movie.budget,
        revenue: movie.revenue,
        runtime: movie.runtime,
        status: movie.status,
        tagline: movie.tagline,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        credits: movie.credits,
        keywords: movie.keywords,
        poster_path:movie.poster_path,
        backdrop_path: movie.backdrop_path,
        recommendations: movie.recommendations
      });
      console.log(`✅ Guardada: ${movie.title}`);
    } catch (err) {
      console.error("❌ Error guardando:", err);
    }
  }
  async change_id(){
    try{
      const docRef = collection(this.firestore, "Peliculas")
      const querySnapshot = await getDocs(docRef);
      
      let errorCount = 0;
      let successCount = 0;
      
      // const new_Id = oldDoc_data["id"].toString();
      // console.log(oldDoc.id + " -> " + oldDoc_data["title"] + new_Id);

    
      
      for (const oldDoc of querySnapshot.docs){
        
        const movieData = oldDoc.data();
        const newId = movieData["id"].toString();
         if (!newId) {
            console.warn(`Documento ${oldDoc.id} no tiene campo 'id', saltando...`);
            errorCount++;
            continue;
        } 
        const nweDocRef = doc(this.firestore, "Peliculas", newId);
        await setDoc(nweDocRef,movieData);
        await deleteDoc(oldDoc.ref);
       

      //   const newDocRef = doc(this.firestore, "Peliculas", oldDoc.id);
      //   await setDoc(newDocRef, movieData);

      //     // Eliminar el documento viejo (solo si se creó el nuevo correctamente)
      //   await deleteDoc(oldDoc.ref);

        console.log(`Migrado: ${oldDoc.id} -> ${newId}`);
        successCount++;
      }
    } catch(error){
      throw error;
    }
  }
}
