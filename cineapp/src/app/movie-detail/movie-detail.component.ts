import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, collection, addDoc, getDocs, query, where } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Movie} from '../entities/movie';
import { useDeviceLanguage } from '@angular/fire/auth';
import { SentimentAnalysisServiceService } from '../services/sentiment-analysis-service.service';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.css'
})
export class MovieDetailComponent implements OnInit{
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
              private firestore: Firestore, private auth: AuthService,
              private sentimentService: SentimentAnalysisServiceService) {}

  async ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('id')!;
    await this.loadMovie();
    await this.loadReviews();
  }


  // getUserById(id: string) {
  //   const userDocRef = doc(this.firestore, `users/${id}`);
  //   return docData(userDocRef, { idField: 'id' }); 
  // }


  async loadMovie() {
    const docRef = collection(this.firestore, "Peliculas");
  
    // const snapshot = await getDoc(docRef);
    // if (snapshot.exists()) {
    //   this.movie = { id: snapshot.id, ...snapshot.data() };
    // }
    console.log(this.movieId);

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
    // const q = query(docRef, where("id", "==", this.movieId));
    
    // const querySnapshot = await getDocs(q);

    // querySnapshot.forEach((doc)=>{console.log(doc.id, "=>", doc.data())})

    // this.movie = { id: querySnapshot.docs.at(0)?.id, ...querySnapshot.docs.at(0)?.data() };
    // console.log(querySnapshot.empty)


    // this.movie = querySnapshot.docs.map(doc => ({
    //   id: doc.id,        // guardamos el id del doc
    //   ...doc.data()      // "spread": todos los campos del documento
    // }));
  }

  async loadReviews() {
    const reviewsRef = collection(this.firestore, "Reviews");
    const q = query(reviewsRef, where("movieId", "==", this.movieId));
    const querySnapshot = await getDocs(q);
    this.reviews = querySnapshot.docs.map(d => d.data());
  }

  async addReview() {
    const user = this.auth.getCurrentUser();
    if (!user) {
      alert("Debes iniciar sesión para dejar una review");
      return;
    }
    // this.sentimentResult = await this.sentimentService.analyzeReview(this.newReview);
    this.analyze();
    console.log(this.sentimentResult);
    const reviewsRef = collection(this.firestore, "Reviews");
    await addDoc(reviewsRef, {
      movieId: this.movieId,
      userId: user.uid,
      email: user.email,
      text: this.newReview,
      date: new Date()
    });
    
    this.newReview = "";
    await this.loadReviews(); // recargar reviews
    
  }

  analyze(){
    if (this.newReview.trim()) {
      this.sentimentService.analyzeReview(this.newReview).subscribe({
        next: (res) => {
          this.sentimentResult = res;
          console.log(res); // ejemplo: [{ "label": "POSITIVE", "score": 0.98 }]
        },
        error: (err) => {
          console.error('Error al analizar la review', err);
        }
      });
  }
}
  goBack() {
    this.router.navigate(["/inicio"]);
  }
}
