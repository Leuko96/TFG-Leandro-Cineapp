import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL} from '@angular/fire/storage';;


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  userEmail: string = '';
  isWorking = false;
  showDeleteConfirm = false;
  deletePhrase = '';
  errorMessage = '';
  profileDisplayName = '';
  profilePhotoUrl = '';
  profileMessage = '';
  profileErrorMessage = '';
  profileLoading = false;
  profileSaving = false;
  selectedImagePreview = '';

  selectedFile: File | null = null;

  constructor(private auth: AuthService, private router: Router, private firestore: Firestore) {
  }

  ngOnInit(): void {
    const currentUser = this.auth.getCurrentUser();
    this.userEmail = currentUser?.email ?? 'Sin email';
    this.loadProfileSettings();
  }

  get profilePhotoPreview(): string {
    if (this.selectedImagePreview) {
      return this.selectedImagePreview;
    }

    const candidate = this.profilePhotoUrl.trim();
    return candidate.length > 0 ? candidate : 'assets/avatar-default.jpeg';
  }

  async loadProfileSettings(): Promise<void> {
    this.profileLoading = true;
    this.profileErrorMessage = '';

    try {
      const currentUser = this.auth.getCurrentUser();
      if (!currentUser?.uid) {
        this.profileErrorMessage = 'No hay sesión activa para cargar el perfil.';
        return;
      }

      this.profileDisplayName = currentUser.displayName ?? '';
      this.profilePhotoUrl = currentUser.photoURL ?? '';

      const profileDoc = await getDoc(doc(this.firestore, 'Usuarios', currentUser.uid));
      if (profileDoc.exists()) {
        const data = profileDoc.data() as Record<string, unknown>;
        const firestoreName = typeof data['nombre'] === 'string' ? data['nombre'].trim() : '';
        const firestoreAvatar = typeof data['avatar'] === 'string' ? data['avatar'].trim() : '';

        if (firestoreName) {
          this.profileDisplayName = firestoreName;
        }

        if (firestoreAvatar) {
          this.profilePhotoUrl = firestoreAvatar;
        }
      }
    } catch (error) {
      console.error(error);
      this.profileErrorMessage = 'No se pudieron cargar los datos del perfil.';
    } finally {
      this.profileLoading = false;
    }
  }

  async saveProfileSettings(): Promise<void> {
    this.profileMessage = '';
    this.profileErrorMessage = '';

    const normalizedName = this.profileDisplayName.trim();

    if (normalizedName.length < 2) {
      this.profileErrorMessage = 'El nombre debe tener al menos 2 caracteres.';
      return;
    }

    this.profileSaving = true;

    try {
      const currentUser = this.auth.getCurrentUser();
      if (!currentUser?.uid) {
        this.profileErrorMessage = 'No hay sesión activa para guardar cambios.';
        return;
      }

      let photoURL = this.profilePhotoUrl;
      let storage = getStorage(); 
      if(this.selectedFile){
        const imageRef = ref(
        storage,
        `avatars/${currentUser.uid}`);

        await uploadBytes(imageRef, this.selectedFile);
        photoURL = await getDownloadURL(imageRef);
      }

      await updateProfile(currentUser, {
        displayName: normalizedName,
        photoURL: photoURL || null
      });

      await setDoc(
        doc(this.firestore, 'Usuarios', currentUser.uid),
        {
          nombre: normalizedName,
          avatar: photoURL || null,
          email: currentUser.email ?? this.userEmail
        },
        { merge: true }
      );

      const stored = localStorage.getItem('usuario');
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, unknown>;
        parsed['nombre'] = normalizedName;
        parsed['avatar'] = photoURL || undefined;
        localStorage.setItem('usuario', JSON.stringify(parsed));
      }

      this.profileDisplayName = normalizedName;
      this.profilePhotoUrl = photoURL || '';
      this.selectedImagePreview = '';
      this.profileMessage = 'Perfil actualizado correctamente.';
    } catch (error) {
      console.error(error);
      this.profileErrorMessage = 'No se pudieron guardar los cambios del perfil.';
    } finally {
      this.profileSaving = false;
    }
  }

  async logout() {
    this.errorMessage = '';
    this.isWorking = true;
    try {
      await this.auth.logout();
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.errorMessage = 'No se pudo cerrar sesión. Inténtalo de nuevo.';
      console.error(error);
    } finally {
      this.isWorking = false;
    }
  }

  openDeleteModal(): void {
    this.errorMessage = '';
    this.deletePhrase = '';
    this.showDeleteConfirm = true;
  }

  closeDeleteModal(): void {
    this.showDeleteConfirm = false;
    this.deletePhrase = '';
  }

  async deleteAccount() {
    if (this.deletePhrase.trim().toUpperCase() !== 'ELIMINAR') {
      this.errorMessage = 'Escribe ELIMINAR para confirmar.';
      return;
    }

    this.errorMessage = '';
    this.isWorking = true;

    try {
      const currentUser = this.auth.getCurrentUser();
      await currentUser?.delete();
      await this.auth.logout();
      this.router.navigate(['/login']);
    } catch (error: any) {
      if (error?.code === 'auth/requires-recent-login') {
        this.errorMessage = 'Por seguridad, vuelve a iniciar sesión antes de eliminar la cuenta.';
      } else {
        this.errorMessage = 'No se pudo eliminar la cuenta. Inténtalo más tarde.';
      }
      console.error(error);
    } finally {
      this.isWorking = false;
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.profileMessage = '';
    this.profileErrorMessage = '';

    if (!file) {
      this.selectedImagePreview = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.profileErrorMessage = 'Selecciona un archivo de imagen valido.';
      this.selectedImagePreview = '';
      return;
    }
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImagePreview = reader.result as string;;
    };
    reader.onerror = () => {
      this.profileErrorMessage = 'No se pudo leer la imagen seleccionada.';
      this.selectedImagePreview = '';
    };

    reader.readAsDataURL(file);
  }

}
