export interface Notification {
  id: number;
  text: string;
  type: notificationType;
  apellido2: string;
  date: Date;
  read: boolean;
  senderId: string;
}

export enum notificationType {
  FriendRequest = 'friend request',
  ReceivedNewMessage = 'Received new message'
}