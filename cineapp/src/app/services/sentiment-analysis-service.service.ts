import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SentimentAnalysisServiceService {
  private apiUrl = 'https://api-inference.huggingface.co/models/lemonsterpie/finetuned-model-movie-review-sentiment-analysis';
  private hfToken = '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'; // tu token aquí

  constructor(private http: HttpClient) {}

  analyzeReview(review: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.hfToken}`,
      'Content-Type': 'application/json'
    });

    const body = { inputs: review };

    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
