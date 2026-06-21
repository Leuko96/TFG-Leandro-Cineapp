import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListsService } from '../services/lists.service';
import { AuthService } from '../services/auth.service';
import { List } from '../entities/lists';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-user-lists',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-lists.component.html',
  styleUrl: './user-lists.component.css'
})
export class UserListsComponent implements OnInit{
  lists: List[] = [];
  newList: Partial<List> = { name: '', description: '', isPublic: true, movieIds: [] };
  viewedUserId: string = '';
  viewedUserName: string = '';
  isOwnLists = true;

  constructor(
    private listsService: ListsService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    const currentUser = this.auth.getCurrentUser();
    const routeUid = this.route.snapshot.paramMap.get('uid');
    this.viewedUserId = routeUid || currentUser?.uid || '';
    this.isOwnLists = !routeUid || routeUid === currentUser?.uid;

    if (this.viewedUserId) {
      this.lists = this.isOwnLists
        ? await this.listsService.getUserLists(this.viewedUserId)
        : await this.listsService.getPublicUserLists(this.viewedUserId);

      if (!this.isOwnLists) {
        const userDoc = await getDoc(doc(this.firestore, 'Usuarios', this.viewedUserId));
        const userData = userDoc.data();
        this.viewedUserName = userData?.['nombre'] || 'Usuario';
      }
    }
  }

  cambiarRuta(id:string){
    console.log(id);
    this.router.navigate(["/list-detail",id]);
  }
  async createList() {
    if (!this.isOwnLists) return;
    if (!this.newList.name) return;

    await this.listsService.createList(this.newList as List);
    const user = this.auth.getCurrentUser();
    if (user) {
      this.lists = await this.listsService.getUserLists(user.uid); // refrescar
    }
    this.newList = { name: '', description: '', isPublic: true, movieIds: [] }; // reset
  }

  async deleteList(id: string) {
    if (!this.isOwnLists) return;
    await this.listsService.deleteList(id);
    if (this.viewedUserId) {
      this.lists = await this.listsService.getUserLists(this.viewedUserId);
    }
  }
}
