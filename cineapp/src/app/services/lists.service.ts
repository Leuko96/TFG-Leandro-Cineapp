import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { List } from '../entities/lists'; 
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ListsService {

  constructor(private firestore: Firestore, private auth: AuthService) {}

  private getCollection() {
    return collection(this.firestore, 'Lists');
  }

  // Crear nueva lista
  async createList(list: Omit<List, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    await addDoc(this.getCollection(), {
      ...list,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Obtener listas del usuario
  async getUserLists(userId: string): Promise<List[]> {
    const q = query(this.getCollection(), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as List[];
  }

  // Actualizar lista
  async updateList(listId: string, data: Partial<List>): Promise<void> {
    const ref = doc(this.firestore, 'Lists', listId);
    await updateDoc(ref, {
      ...data,
      updatedAt: new Date()
    });
  }

  // Eliminar lista
  async deleteList(listId: string): Promise<void> {
    const ref = doc(this.firestore, 'Lists', listId);
    await deleteDoc(ref);
  }
}
