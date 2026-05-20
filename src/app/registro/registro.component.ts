import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  success = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (!this.nombre || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Por favor completá todos los campos.';
      this.success = '';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      this.success = '';
      return;
    }
    this.error = '';
    this.success = '¡Registro exitoso! Redirigiendo...';
    setTimeout(() => this.router.navigate(['/ingresar']), 1500);
  }
}
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  nombre = '';
  apellido = '';
  edad: number | null = null;
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  success = '';
  loading = false;

  constructor(private router: Router, private authService: AuthService) {}

  async onSubmit() {
    if (!this.nombre || !this.apellido || !this.edad || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Por favor completá todos los campos.';
      this.success = '';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      this.success = '';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      this.success = '';
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      await this.authService.register(this.email, this.password, this.nombre, this.apellido, this.edad);
      this.success = '¡Registro exitoso! Redirigiendo...';
      setTimeout(() => this.router.navigate(['/home']), 1500);
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        this.error = 'El email ya está registrado.';
      } else {
        this.error = 'Error al registrar. Intentá de nuevo.';
      }
    } finally {
      this.loading = false;
    }
  }
}
