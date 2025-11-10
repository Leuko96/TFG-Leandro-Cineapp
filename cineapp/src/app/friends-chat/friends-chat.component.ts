import { Component } from '@angular/core';
import { FriendsChatService } from '../services/friends-chat.service';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-friends-chat',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './friends-chat.component.html',
  styleUrl: './friends-chat.component.css'
})
export class FriendsChatComponent {

  messages: any[] = [];
  newMessage: string = '';
  friendId: string = '';
  unsub: any;
  currentUserId: string = '';

  constructor(
    private chatService: FriendsChatService,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    const user = this.auth.getCurrentUser();
    if(user)
      this.currentUserId = user?.uid;
    this.friendId = this.route.snapshot.paramMap.get('friendId') || '';

    if (!user || !this.friendId) return;

    await this.chatService.createChatIfNotExists(user.uid, this.friendId);

    this.unsub = this.chatService.listenToMessages(user.uid, this.friendId, msgs => {
      this.messages = msgs;
    });
  }

  async send() {
    const user = this.auth.getCurrentUser();
    if (!user || !this.newMessage.trim()) return;

    await this.chatService.sendMessage(user.uid, this.friendId, this.newMessage.trim());
    this.newMessage = '';
  }

  ngOnDestroy() {
    if (this.unsub) this.unsub();
  }
}
