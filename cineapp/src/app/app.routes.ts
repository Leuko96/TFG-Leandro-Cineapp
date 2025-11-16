import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SearchFilmsComponent } from './search-films/search-films.component';
import { LoadMoviesComponent } from './load-movies/load-movies.component';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { UserListsComponent } from './user-lists/user-lists.component';
import { ListDetailComponent } from './list-detail/list-detail.component';
import { SettingsComponent } from './settings/settings.component';
import { SocialNetworkComponent } from './social-network/social-network.component';


export const routes: Routes = [
    {path: "inicio", component: InicioComponent},
    {path: "login", component: LoginComponent},
    {path: "register", component: RegisterComponent},
    {path: "load-movies", component: LoadMoviesComponent},
    {path: "movie/:id", component: MovieDetailComponent },
    {path: "mylists", component: UserListsComponent},
    {path: "list-detail/:id", component: ListDetailComponent},
    {path: "settings", component: SettingsComponent},
    {path: "socialNetwork", component: SocialNetworkComponent},
    {path: "search-films", component: SearchFilmsComponent, data: { animation: 'SearchPage' }},
    
    
    {path: '' , redirectTo:'/login', pathMatch:'full'},
    // { path: '**', redirectTo: '/login' }
];
