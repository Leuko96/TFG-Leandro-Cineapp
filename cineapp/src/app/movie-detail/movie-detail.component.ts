import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc, collection, addDoc, getDocs, query, where } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Movie} from '../entities/movie';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.css'
})
export class MovieDetailComponent implements OnInit{
  movieId!: string;
  movie: any;
  reviews: any[] = [];
  newReview: string = "";
  title : string="";
  constructor(private route: ActivatedRoute, private firestore: Firestore, private auth: AuthService) {}

  async ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('id')!;
    console.log(this.movieId);
    await this.loadMovie();
    await this.loadReviews();
  }

  async loadMovie() {
    const docRef = collection(this.firestore, "Peliculas");
  
    // const snapshot = await getDoc(docRef);
    // if (snapshot.exists()) {
    //   this.movie = { id: snapshot.id, ...snapshot.data() };
    // }

    const q = query(docRef, where("id", "==", "50000000"));
    
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc)=>{console.log(doc.id, "=>", doc.data)})

    this.movie = { id: querySnapshot.docs.at(0)?.id, ...querySnapshot.docs.at(0)?.data };
    console.log(querySnapshot.empty)
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
}
