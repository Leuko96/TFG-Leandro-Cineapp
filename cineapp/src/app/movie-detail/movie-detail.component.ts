import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, collection, addDoc, getDocs, query, where } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Movie} from '../entities/movie';
import { useDeviceLanguage } from '@angular/fire/auth';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.css'
})
export class MovieDetailComponent implements OnInit{

  //Palomitas
  numbers = Array.from({ length: 10 }, (_, i) => i + 1);
  rating: number = 0;

  movieId: string="";
  movie: any;
  reviews: any[] = [];
  newReview: string = "";
  sentimentResult: any;

  id: number = 0;
  title: string = "";
  genres: string = "";
  original_language: string = "";
  overview: string = "";
  popularity: number = 0;
  production_companies: string = "";
  release_date: string = "";
  budget: number = 0;
  revenue: number = 0;
  runtime: number = 0;
  status: string = "";
  tagline: string = "";
  vote_average: number = 0;
  vote_count: number = 0;
  credits: string = "";
  keywords: string = "";
  poster_path:string = "";
  backdrop_path: string = "";
  recommendations: string = "";

  constructor(private route: ActivatedRoute, private router: Router, 
              private firestore: Firestore, private auth: AuthService) {}

  async ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('id')!;
    await this.loadMovie();
    await this.loadReviews();
  }


  async loadMovie() {
    const docRef = collection(this.firestore, "Peliculas");


    const userDocRef = doc(this.firestore, `Peliculas/${this.movieId}`);
    const peli = await getDoc(userDocRef);
    
    if(peli.exists()){
      const peli_data = peli.data();
      this.title = peli_data["title"];
      this.production_companies = peli_data["production_companies"];
      this.vote_count = peli_data["vote_count"];
      this.original_language = peli_data["original_language"];
      this.vote_average = peli_data["vote_average"];
      this.tagline = peli_data["tagline"];
      this.revenue = peli_data["revenue"];
      this.status = peli_data["status"];
      this.runtime = peli_data["runtime"];
      this.release_date = peli_data["release_date"];
      this.recommendations = peli_data["recommendations"];
      this.poster_path = peli_data["poster_path"];
      this.popularity = peli_data["popularity"];
      this.overview = peli_data["overview"];
      
      console.log(peli_data["title"]);

      return peli_data;
    }
    else{
      return null;
    }

  }

  async loadReviews() {
    const reviewsRef = collection(this.firestore, "Reviews");
    const q = query(reviewsRef, where("movieId", "==", this.movieId));
    const querySnapshot = await getDocs(q);
    this.reviews = querySnapshot.docs.map(d => d.data());
    this.reviews.sort((a, b) => b.date.toMillis() - a.date.toMillis());
  }

  async addReview() {
    const user = this.auth.getCurrentUser();
    if (!user) {
      alert("Debes iniciar sesión para dejar una review");
      return;
    }
    if((!this.rating || this.rating===0) && this.newReview.trim().length === 0){
      alert("Please, submit a rating or/and a review");
      return;
    }
    const reviewsRef = collection(this.firestore, "Reviews");
    const docAdded = await addDoc(reviewsRef, {
      movieId: this.movieId,
      userId: user.uid,
      email: user.email,
      text: this.newReview,
      date: new Date(),
      rating: this.rating
    });
  
    const actionRef = collection(this.firestore, "Actions");
    var extraInfo = "";
    if(this.rating!=null && this.rating!==0){
      console.log("rating: " + this.rating);
      extraInfo = "Has puntuado " + this.title + " con " + this.rating + " palomitas ";
      if(this.newReview !=null &&this.newReview.trim().length > 0){
        extraInfo += " y has dejado la siguiente review: " + this.newReview;
      }
    
    }else if(this.newReview !=null && this.newReview.trim().length > 0){
      extraInfo = "Has dejado la siguiente review sobre " + this.title + ": " + this.newReview;
    }
    console.log(extraInfo);
    await addDoc(actionRef, { 
      userId: user.uid,
      movieId: this.movieId,
      type: "review",
      createdAt: new Date(),
      extraInfo: extraInfo
    });

    this.newReview = "";
    await this.loadReviews(); // recargar reviews
    
  }

  goBack() {
    this.router.navigate(["/inicio"]);
  }
  setRating(value: number) {
    if(this.rating!=null && this.rating === value)
      this.rating = 0; // deseleccionar si se hace clic en la misma calificación
    else
      this.rating = value;
    console.log(this.rating);
  }

}
