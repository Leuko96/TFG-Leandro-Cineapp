import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, from } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { collection, Firestore, query, getDocs, orderBy, limit } from '@angular/fire/firestore';

/** Modelo que usará tu UI */
export interface NewsPanelItem {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: Date |string;
  source: {
    name: string;
    url: string;
  };
  createdAt: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsPanelService {


  // estado local
  private readonly newsSubject = new BehaviorSubject<NewsPanelItem[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // streams públicos
  readonly news$ = this.newsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly firestore: Firestore
  ) {}

  loadLatestCinemaNews(): Observable<NewsPanelItem[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return from(this.fetchNewsFromFirestore()).pipe(
      tap((list: NewsPanelItem[]) => this.newsSubject.next(list)),
      catchError((err) => {
        console.error("Error cargando noticias:", err);
        this.errorSubject.next('Error cargando noticias');
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }
private async fetchNewsFromFirestore(): Promise<NewsPanelItem[]> {
    try {
      const newsRef = collection(this.firestore, 'News');
      const q = query(newsRef, orderBy('publishedAt', 'desc'), limit(10));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data['title'] || '',
          description: data['description'] || '',
          content: data['content'] || '',
          url: data['url'] || '',
          image: data['image'] || 'assets/news-placeholder.jpg',
          publishedAt: data['publishedAt']?.toDate?.() || null,
          source: {
            name: data['source']?.name || '',
            url: data['source']?.url || ''
          },
          createdAt: data['createdAt']?.toDate?.() || new Date()
        };
      });
    } catch (error) {
      console.error("Error fetching from Firestore:", error);
      throw error;
    }
  }
  
  refresh(): Observable<NewsPanelItem[]> {
    return this.loadLatestCinemaNews();
  }

  getSnapshot(): NewsPanelItem[] {
    return this.newsSubject.value;
  }

  clearNews(): void {
    this.newsSubject.next([]);
  }

  clearError(): void {
    this.errorSubject.next(null);
  }
}