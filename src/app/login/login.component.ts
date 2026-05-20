import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  onSubmit() {
    if (this.email && this.password) {
      this.router.navigate(['/']);
    } else {
      this.error = 'Por favor completá todos los campos.';
    }
  }
}
