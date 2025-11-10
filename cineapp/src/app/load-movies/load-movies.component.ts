import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { FormsModule } from '@angular/forms';
import { collection, Firestore, getDocs, doc, updateDoc, getDoc, deleteDoc, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-load-movies',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './load-movies.component.html',
  styleUrl: './load-movies.component.css'
})
export class LoadMoviesComponent {
  status = "Esperando";
  idStatus = "Esperando";

  coleccion = '';
  docId = '';
  nuevoCampo = '';
  nuevoValor: any = '';
  nuevoDocumento: any = {};
  usuarioTarget = '';

  constructor(private movieService: MovieService, private firestore: Firestore) {}

  async cargarDataset(){
    this.status = "Cargando dataset";
    let offset = 0;
    const batchSize = 100;
    const total = 5000;

    while (offset < total){
      this.status = `Cargando películas desde ${offset} a ${offset + batchSize}...`;
      console.log(this.status);

      const movies = await this.movieService.getMovies(offset,batchSize);

      for(let movie of movies){
        
        await this.movieService.saveMovie(movie);
      }
      // await this.movieService.saveMovie(movies);
      offset += batchSize;
      // offset = total;
    }
    this.status = "✅ Dataset cargado en Firestore";
    
  }

  change_id(){
    this.movieService.change_id();
  }

  async meterID() {
      this.idStatus = "🔄 Añadiendo campo 'id' a todos los usuarios...";
      const usuariosRef = collection(this.firestore, 'Usuarios');
      const snapshot = await getDocs(usuariosRef);
  
      let count = 0;
      for (const docSnap of snapshot.docs) {
        const userId = docSnap.id;
        const userRef = doc(this.firestore, 'Usuarios', userId);
        await updateDoc(userRef, { Amigos: [],id: userId });
        count++;
      }
  
      this.idStatus = `✅ Campo 'id' añadido a ${count} usuarios`;
      console.log(this.idStatus);
    }

     async crearDocumento() {
    if (!this.coleccion || !this.nuevoDocumento) return alert('Falta nombre de colección o datos');
    const ref = collection(this.firestore, this.coleccion);
    await addDoc(ref, this.nuevoDocumento);
    alert(`✅ Documento creado en ${this.coleccion}`);
  }

  /** ✏️ Modificar campo específico de un documento */
  async actualizarCampo() {
    if (!this.coleccion || !this.docId || !this.nuevoCampo) return alert('Completa todos los campos');
    const ref = doc(this.firestore, this.coleccion, this.docId);
    await updateDoc(ref, { [this.nuevoCampo]: this.nuevoValor });
    alert(`✅ Campo '${this.nuevoCampo}' actualizado`);
  }

  /** 🗑️ Eliminar documento por ID */
  async eliminarDocumento() {
    if (!this.coleccion || !this.docId) return alert('Falta colección o ID');
    const ref = doc(this.firestore, this.coleccion, this.docId);
    await deleteDoc(ref);
    alert(`🗑️ Documento '${this.docId}' eliminado`);
  }

  /** 👁️ Mostrar datos de un documento */
  async verDocumento() {
    if (!this.coleccion || !this.docId) return alert('Falta colección o ID');
    const ref = doc(this.firestore, this.coleccion, this.docId);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      console.log('📄 Documento:', snapshot.data());
      alert(JSON.stringify(snapshot.data(), null, 2));
    } else {
      alert('❌ Documento no encontrado');
    }
  }

  /** 📋 Listar documentos de una colección */
  async listarColeccion() {
    if (!this.coleccion) return alert('Falta nombre de colección');
    const ref = collection(this.firestore, this.coleccion);
    const snapshot = await getDocs(ref);
    const datos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log('📚 Colección:', datos);
    alert(`✅ ${datos.length} documentos encontrados (ver consola)`);
  }

  async crearSubcoleccionNotificaciones(usuarioId: string) {
  const notificacionesRef = collection(this.firestore, `Usuarios/${usuarioId}/Notificaciones`);

  const ejemplos = [
    {
      tipo: 'amistad',
      mensaje: 'Juan quiere agregarte como amigo',
      leida: false,
      timestamp: new Date().toISOString(),
      datosExtra: { remitenteId: 'juan123' }
    },
    {
      tipo: 'sistema',
      mensaje: 'Tu cuenta ha sido verificada correctamente',
      leida: false,
      timestamp: new Date().toISOString()
    }
  ];

  for (const notif of ejemplos) {
    await addDoc(notificacionesRef, notif);
  }

  alert(`✅ Subcolección "Notificaciones" creada para el usuario ${usuarioId}`);
}
}
