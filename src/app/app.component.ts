import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { AuthService } from './auth.service';
import { User } from 'firebase/auth';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({ position: 'absolute', width: '100%' })
    ], { optional: true }),
    query(':leave', [
      animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('320ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ], { optional: true })
  ])
]);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [routeAnimations]
})
export class AppComponent {
  title = 'tp-sala-juegos';
  currentUser: User | null = null;
  isAdmin = false;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.currentUser$.subscribe(async u => {
      this.currentUser = u;
      this.isAdmin = u ? await this.authService.isAdmin(u.uid) : false;
    });
  }

  prepareRoute(outlet: RouterOutlet) {
    if (!outlet?.isActivated) return null;
    return outlet?.activatedRouteData?.['animation'] ?? outlet?.activatedRoute?.snapshot?.url?.[0]?.path;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/ingresar'], { skipLocationChange: true });
  }
}
