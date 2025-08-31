import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterOutlet } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
import { Register } from '../entities/register'
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, RouterOutlet],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    registerInfo: Register = {email: '', password: '', favourite_film: '', name: '', surname1: '', surname2:''};
        error: string = '';
      
        constructor(private usuarioService: UsuariosService, private router: Router) {}
        register(){
          this.router.navigate(['/register']);
        }
        login() {
          this.usuarioService.doLogin(this.registerInfo).subscribe({
            next: (usuario) => {
              this.router.navigate(['/inicio']);
            },
            error: (error) => {
              this.registerInfo = {email: '', password: '', favourite_film: '', name: '', surname1: '', surname2:''};
              if (error.status === 401) {
                this.error = 'Usuario o contraseña incorrectos';
              } else {
                this.error = error.statusText;
              }
      
            }
          });
        }
        
      
        get usuario() {
          return this.usuarioService.getUsuarioSesion();
        }
}
