import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListsService } from '../services/lists.service';
import { AuthService } from '../services/auth.service';
import { List } from '../entities/lists';
import { Router } from '@angular/router';

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

  constructor(private listsService: ListsService, private auth: AuthService, private router: Router) {}

  async ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.lists = await this.listsService.getUserLists(user.uid);
    }
  }

  cambiarRuta(id:string){
    console.log(id);
    this.router.navigate(["/list-detail",id]);
  }
  async createList() {
    if (!this.newList.name) return;

    await this.listsService.createList(this.newList as List);
    const user = this.auth.getCurrentUser();
    if (user) {
      this.lists = await this.listsService.getUserLists(user.uid); // refrescar
    }
    this.newList = { name: '', description: '', isPublic: true, movieIds: [] }; // reset
  }

  async deleteList(id: string) {
    await this.listsService.deleteList(id);
    const user = this.auth.getCurrentUser();
    if (user) {
      this.lists = await this.listsService.getUserLists(user.uid);
    }
  }
}
