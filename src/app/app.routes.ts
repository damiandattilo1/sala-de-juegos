import { Routes } from '@angular/router';
import { QuienSoyComponent } from './quien-soy/quien-soy.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegistroComponent } from './registro/registro.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [authGuard] },
    { path: 'ingresar', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'quien-soy', component: QuienSoyComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' },
];
