
import { Component, HostListener } from '@angular/core';
import { Usuario, UsuarioImpl } from '../entities/usuario';
import { UsuariosService } from '../services/usuarios.service';
import { FirebaseService } from '../services/firebase.service';
import { AuthService } from '../services/auth.service';
import { NotificationsService } from '../services/notifications.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { doc, getDoc , Firestore, DocumentData, collection, getDocs, query, where, orderBy, limit } from '@angular/fire/firestore';
import { user } from '@angular/fire/auth';
import { getApp, provideFirebaseApp } from '@angular/fire/app';
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { notificationType } from '../entities/notification';
import { SocialNetworkService } from '../services/social-network.service';
import { NewsPanelService, NewsPanelItem } from '../services/news-panel.service';
import { ActionType, Action } from '../entities/actions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class InicioComponent {
  
  showNotifications = false;
  nombre: string = "";
  apellido1: string = "";
  apellido2: string = "";
  fecharegistro: Date = new Date();
  email: string = "";
  usrId: string = "";
  avatar: string = "";
  
  notificationsList: any[] = [];
  enumBoolean = notificationType;
  
  listFriends: DocumentData[] = [];
  listFriendsSender: DocumentData[] = [];
  recentActions: Array<Omit<Action, 'createdAt'> & { createdAt: Date | null }> = [];
  recentActionsLoading = false;
  recentActionsError: string | null = null;
  readonly actionType = ActionType;
  newsList: NewsPanelItem[] = [];
  newsLoading = false;
  newsError: string | null = null;
  newsPageIndex = 0;
  private viewportWidth = window.innerWidth;
  private destroy$ = new Subject<void>();

  constructor(
    private usuarioService: UsuariosService, private auth: AuthService, 
    private firestore : Firestore, private notifications: NotificationsService,
    private socialService: SocialNetworkService,
    private newsPanelService: NewsPanelService
    
  ) {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.email = user.email?? "null" ;
        this.apellido1 = user.uid?? "null";
      } else {
        console.log("No hay sesión");
      }
    });



    this.nombre = this.auth.getCurrentUser()?.email ?? "null";
    this. apellido1 = this.auth.getCurrentUser()?.uid ?? "null";
    
    // this. apellido2 = this.usuarioSesion?.apellido1 ?? "null";
    // this.fecharegistro = this.usuarioSesion?.fecha_registro?? new Date(0,0,0);
    // this.actualizarRol();
    // 
   
  }

  async run(){
    // if(notificationType.FriendRequest==""){

    // }
    const app = getApp();
    const ai = getAI(app, {backend: new GoogleAIBackend});
    const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
    const prompt = "Write a story about a magic backpack."

    // To generate text output, call generateContent with the text input
    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response.text();
    console.log(text);
  }

  async ngOnInit() {
    console.log(true);
    // this.run();
    // const usuarios = await this.fbService.getUsuarios();
    // console.log("Usuarios Firestore:", usuarios);
    const user = this.auth.getCurrentUser();
    if(user){

      this.notificationsList = await this.notifications.getNotifications(user.uid);
      this.usrId = user.uid;
      const docRef = doc(this.firestore,"Usuarios",user.uid);
      const userDoc = await getDoc(docRef); 
      if(userDoc.exists()){
        const data = userDoc.data();
        this.nombre = data['nombre'];
        this.apellido1 = data["apellido1"];
        this.apellido2 = data["apellido2"];
        this.email = data["email"];
        this.fecharegistro = data["fecha_registro"].toDate();
        this.avatar = data["avatar"] || "assets/avatar-default.jpeg";
      }
    }

    await this.loadRecentActions();
    this.loadNews();
  }

  private async loadRecentActions(): Promise<void> {
    if (!this.usrId) {
      this.recentActions = [];
      return;
    }

    this.recentActionsLoading = true;
    this.recentActionsError = null;

    try {
      const actionsRef = collection(this.firestore, 'Actions');
      const actionsQuery = query(
        actionsRef,
        where('userId', '==', this.usrId),
        where('type', 'in', [ActionType.Review, ActionType.AddToList]),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(actionsQuery);
      this.recentActions = snapshot.docs.map((actionDoc) => {
        const data: Action = actionDoc.data() as Action;
        return {
          id: actionDoc.id,
          type: data['type'] as ActionType,
          extraInfo: (data['extraInfo'] ?? 'Nueva actividad').toString(),
          createdAt: this.normalizeActionDate((data as any)['createdAt']),
          userId: data['userId']
        };
      });
    } catch (error) {
      console.error('Error cargando acciones recientes:', error);
      this.recentActionsError = 'No se pudo cargar la actividad reciente';
      this.recentActions = [];
    } finally {
      this.recentActionsLoading = false;
    }
  }

  getActionLabel(type: ActionType): string {
    if (type === ActionType.Review) {
      return 'Review';
    }
    if (type === ActionType.AddToList) {
      return 'Lista';
    }
    return 'Actividad';
  }

  getActionIcon(type: ActionType): string {
    if (type === ActionType.Review) {
      return '📝';
    }
    if (type === ActionType.AddToList) {
      return '📌';
    }
    return '✨';
  }

  private normalizeActionDate(rawValue: any): Date | null {
    if (!rawValue) {
      return null;
    }

    if (rawValue instanceof Date) {
      return isNaN(rawValue.getTime()) ? null : rawValue;
    }

    if (typeof rawValue?.toDate === 'function') {
      const parsedFromToDate = rawValue.toDate();
      return parsedFromToDate instanceof Date && !isNaN(parsedFromToDate.getTime())
        ? parsedFromToDate
        : null;
    }

    if (typeof rawValue === 'object' && typeof rawValue.seconds === 'number') {
      const millis = (rawValue.seconds * 1000) + Math.floor((rawValue.nanoseconds ?? 0) / 1_000_000);
      const parsedFromSeconds = new Date(millis);
      return isNaN(parsedFromSeconds.getTime()) ? null : parsedFromSeconds;
    }

    const parsed = new Date(rawValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private loadNews(): void {
    this.newsPanelService.loadLatestCinemaNews()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (news) => {
          this.newsList = news;
          this.newsPageIndex = 0;
        },
        error: (err) => {
          console.error('Error cargando noticias:', err);
          this.newsError = 'No se pudieron cargar las noticias';
        }
      });

    this.newsPanelService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.newsLoading = loading);

    this.newsPanelService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.newsError = error);
  }

  refreshNews(): void {
    this.newsPanelService.refresh()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.newsPageIndex = 0;
        }
      });
  }

  get itemsPerNewsPage(): number {
    if (this.viewportWidth <= 760) {
      return 1;
    }
    if (this.viewportWidth <= 1100) {
      return 2;
    }
    return 3;
  }

  get visibleNews(): NewsPanelItem[] {
    const start = this.newsPageIndex * this.itemsPerNewsPage;
    const end = start + this.itemsPerNewsPage;
    return this.newsList.slice(start, end);
  }

  get totalNewsPages(): number {
    if (this.newsList.length === 0) {
      return 0;
    }
    return Math.ceil(this.newsList.length / this.itemsPerNewsPage);
  }

  prevNewsPage(): void {
    if (this.totalNewsPages <= 1) {
      return;
    }
    this.newsPageIndex = this.newsPageIndex === 0
      ? this.totalNewsPages - 1
      : this.newsPageIndex - 1;
  }

  nextNewsPage(): void {
    if (this.totalNewsPages <= 1) {
      return;
    }
    this.newsPageIndex = this.newsPageIndex === this.totalNewsPages - 1
      ? 0
      : this.newsPageIndex + 1;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.viewportWidth = window.innerWidth;
    if (this.newsPageIndex >= this.totalNewsPages) {
      this.newsPageIndex = Math.max(this.totalNewsPages - 1, 0);
    }
  }

  onNewsImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.src = 'assets/news-placeholder.jpg';
    }
  }
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
  
  get usuarioSesion() {
    return this.auth.getCurrentUser()?.displayName;
  }
  
  async toggleNotifications() {
    if(!this.showNotifications){
      await this.notifications.setAllAsRead(this.usrId,this.notificationsList);
      console.log(this.notifications);
    }
    this.showNotifications = !this.showNotifications;
  }

  get unreadNotificationsCount(): number {
    return this.notificationsList.filter(n => !n.read).length;
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadNotificationsCount > 0;
  }

  async markRead(notifId: string) {
    await this.notifications.setAsRead(this.usrId, notifId);
    this.notificationsList = this.notificationsList.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    );
  }

    async removeNotification(notifId: string){
      await this.notifications.deleteNotifications(this.usrId,notifId);
      this.notificationsList = this.notificationsList.filter(n => n.id !== notifId);
    }
    
    async addFriendFromNot(notiIfid: string) {

      const docNotRef = doc(this.firestore, "Usuarios", this.usrId, "Notifications", notiIfid);

      const docNot = (await getDoc(docNotRef)).data();
      console.log(docNot);
      if(docNot){
        const newFriendId = docNot['senderId'];
        await this.socialService.addFriend(newFriendId, this.listFriends);
        await this.removeNotification(notiIfid)
      }
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
}
