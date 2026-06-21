import { Timestamp } from "@angular/fire/firestore";

export enum ActionType {
  Like = 'like',
  Search = 'search',
  Review = 'review',
  AddToList = 'add_to_list'
}

export interface Action {
  id: string;
  createdAt: Date;
  extraInfo?: string;
  movieId?: string;
  type: ActionType;
  userId: string;
  poster_path?: string;
}