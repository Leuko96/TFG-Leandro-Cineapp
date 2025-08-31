import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SearchFilmsComponent } from './search-films/search-films.component';

export const routes: Routes = [
    {path: "inicio", component: InicioComponent},
    {path: "login", component: LoginComponent},
    {path: "register", component: RegisterComponent},
    {path: "search-films", component: SearchFilmsComponent, data: { animation: 'SearchPage' }},
    {path: '' , redirectTo:'/login', pathMatch:'full'}
];
