import { Routes } from '@angular/router';
import { QuienSoyComponent } from './quien-soy/quien-soy.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegistroComponent } from './registro/registro.component';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { AhorcadoComponent } from './ahorcado/ahorcado.component';
import { MayorMenorComponent } from './mayor-menor/mayor-menor.component';
import { ChatComponent } from './chat/chat.component';
import { PreguntadosComponent } from './preguntados/preguntados.component';
import { GeneralaSimpleComponent } from './generala-simple/generala-simple.component';
import { ResultadosComponent } from './resultados/resultados.component';
import { EncuestaComponent } from './encuesta/encuesta.component';
import { EncuestaResultadosComponent } from './encuesta-resultados/encuesta-resultados.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, data: { animation: 'home' } },
    { path: 'ingresar', component: LoginComponent, data: { animation: 'ingresar' } },
    { path: 'registro', component: RegistroComponent, data: { animation: 'registro' } },
    { path: 'quien-soy', component: QuienSoyComponent, data: { animation: 'quien-soy' } },
    { path: 'ahorcado', component: AhorcadoComponent, canActivate: [authGuard], data: { animation: 'ahorcado' } },
    { path: 'mayor-menor', component: MayorMenorComponent, canActivate: [authGuard], data: { animation: 'mayor-menor' } },
    { path: 'preguntados', component: PreguntadosComponent, canActivate: [authGuard], data: { animation: 'preguntados' } },
    { path: 'generala-simple', component: GeneralaSimpleComponent, canActivate: [authGuard], data: { animation: 'generala-simple' } },
    { path: 'chat', component: ChatComponent, canActivate: [authGuard], data: { animation: 'chat' } },
    { path: 'resultados', component: ResultadosComponent, canActivate: [authGuard], data: { animation: 'resultados' } },
    { path: 'encuesta', component: EncuestaComponent, canActivate: [authGuard], data: { animation: 'encuesta' } },
    { path: 'encuesta-resultados', component: EncuestaResultadosComponent, canActivate: [adminGuard], data: { animation: 'encuesta-resultados' } },
    { path: '**', redirectTo: '', pathMatch: 'full' },
];
