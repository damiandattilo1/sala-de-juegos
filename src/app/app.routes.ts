import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent), data: { animation: 'home' } },
    { path: 'ingresar', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent), data: { animation: 'ingresar' } },
    { path: 'registro', loadComponent: () => import('./registro/registro.component').then(m => m.RegistroComponent), data: { animation: 'registro' } },
    { path: 'quien-soy', loadComponent: () => import('./quien-soy/quien-soy.component').then(m => m.QuienSoyComponent), data: { animation: 'quien-soy' } },
    { path: 'ahorcado', loadComponent: () => import('./ahorcado/ahorcado.component').then(m => m.AhorcadoComponent), canActivate: [authGuard], data: { animation: 'ahorcado' } },
    { path: 'mayor-menor', loadComponent: () => import('./mayor-menor/mayor-menor.component').then(m => m.MayorMenorComponent), canActivate: [authGuard], data: { animation: 'mayor-menor' } },
    { path: 'preguntados', loadComponent: () => import('./preguntados/preguntados.component').then(m => m.PreguntadosComponent), canActivate: [authGuard], data: { animation: 'preguntados' } },
    { path: 'generala-simple', loadComponent: () => import('./generala-simple/generala-simple.component').then(m => m.GeneralaSimpleComponent), canActivate: [authGuard], data: { animation: 'generala-simple' } },
    { path: 'chat', loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent), canActivate: [authGuard], data: { animation: 'chat' } },
    { path: 'resultados', loadComponent: () => import('./resultados/resultados.component').then(m => m.ResultadosComponent), canActivate: [authGuard], data: { animation: 'resultados' } },
    { path: 'encuesta', loadComponent: () => import('./encuesta/encuesta.component').then(m => m.EncuestaComponent), canActivate: [authGuard], data: { animation: 'encuesta' } },
    { path: 'encuesta-resultados', loadComponent: () => import('./encuesta-resultados/encuesta-resultados.component').then(m => m.EncuestaResultadosComponent), canActivate: [adminGuard], data: { animation: 'encuesta-resultados' } },
    { path: '**', redirectTo: '', pathMatch: 'full' },
];
