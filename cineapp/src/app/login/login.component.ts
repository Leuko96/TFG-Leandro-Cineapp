import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterOutlet } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
import { Login } from '../entities/login'
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, RouterOutlet],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginInfo: Login = {email: '', password: ''};
    error: string = '';
  
    constructor(private usuarioService: UsuariosService, private router: Router) {}
    register(){
      this.router.navigate(['/register']);
    }
    login() {
      this.usuarioService.doLogin(this.loginInfo).subscribe({
        next: (usuario) => {
          this.router.navigate(['/inicio']);
        },
        error: (error) => {
          this.loginInfo = {email: '', password: ''};
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
