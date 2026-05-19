import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  testUsers = [
    { label: 'Usuario 1', email: 'usuario1@test.com', password: '123456' },
    { label: 'Usuario 2', email: 'usuario2@test.com', password: '123456' },
    { label: 'Usuario 3', email: 'usuario3@test.com', password: '123456' },
  ];

  constructor(private router: Router, private authService: AuthService) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Por favor completá todos los campos.';
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch {
      this.error = 'Credenciales incorrectas. Verificá tu email y contraseña.';
    } finally {
      this.loading = false;
    }
  }

  async quickLogin(email: string, password: string) {
    this.loading = true;
    this.error = '';
    try {
      await this.authService.login(email, password);
      this.router.navigate(['/home']);
    } catch {
      this.error = 'Error al iniciar sesión rápido.';
    } finally {
      this.loading = false;
    }
  }
}
