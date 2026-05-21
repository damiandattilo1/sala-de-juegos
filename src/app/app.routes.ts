import { Routes } from '@angular/router';
import { QuienSoyComponent } from './quien-soy/quien-soy.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegistroComponent } from './registro/registro.component';
import { authGuard } from './auth.guard';
import { AhorcadoComponent } from './ahorcado/ahorcado.component';
import { MayorMenorComponent } from './mayor-menor/mayor-menor.component';
import { ChatComponent } from './chat/chat.component';
import { PreguntadosComponent } from './preguntados/preguntados.component';
import { GeneralaSimpleComponent } from './generala-simple/generala-simple.component';
import { ResultadosComponent } from './resultados/resultados.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'ingresar', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'quien-soy', component: QuienSoyComponent },
    { path: 'ahorcado', component: AhorcadoComponent, canActivate: [authGuard] },
    { path: 'mayor-menor', component: MayorMenorComponent, canActivate: [authGuard] },
    { path: 'preguntados', component: PreguntadosComponent, canActivate: [authGuard] },
    { path: 'generala-simple', component: GeneralaSimpleComponent, canActivate: [authGuard] },
    { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
    { path: 'resultados', component: ResultadosComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '', pathMatch: 'full' },
];
