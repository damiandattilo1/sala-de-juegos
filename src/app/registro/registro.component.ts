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
    setTimeout(() => this.router.navigate(['/login']), 1500);
  }
}
