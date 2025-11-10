import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
    profile = {
      nombre: '',
      apellido1: '',
      apellido2: '',
      favouriteFilm: '',
      photoUrl: ''
    };
  // Preferencias
  preferences = {
    darkMode: false,
    language: 'es'
  };

  constructor(private auth: AuthService, private router: Router) {}

  saveProfile() {
    console.log('Perfil actualizado:', this.profile);
    alert('✅ Perfil guardado correctamente');
  }

  savePreferences() {
    console.log('Preferencias guardadas:', this.preferences);
    alert('⚙️ Preferencias actualizadas');
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  deleteAccount() {
    if (confirm('¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      console.log('Cuenta eliminada');
      // Aquí iría la lógica real para borrar cuenta de Firebase
      this.router.navigate(['/login']);
    }
  }
}
