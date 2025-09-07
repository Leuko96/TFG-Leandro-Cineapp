export interface List {
  id: string;
  name: string;
  description?: string;
  userId: string;
  movieIds: string[]; // IDs de las películas en esta lista
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  coverImage?: string; // URL de imagen de portada
}