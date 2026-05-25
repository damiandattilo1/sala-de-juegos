import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../auth.service';
import { GameDataService } from '../services/game-data.service';
import { User } from 'firebase/auth';

function atLeastOneGenero(control: AbstractControl): ValidationErrors | null {
  const group = control as FormGroup;
  const selected = Object.values(group.value).some(v => v === true);
  return selected ? null : { atLeastOne: true };
}

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.css'
})
export class EncuestaComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  loading = false;
  successMsg = '';
  errorMsg = '';
  currentUser: User | null = null;
  yaRespondio = false;

  frecuencias = ['Nunca', 'A veces', 'Frecuentemente', 'Siempre'];
  generos = ['Acción', 'Estrategia', 'Trivia', 'Deportes', 'Aventura'];
  juegosFavoritos = ['Ahorcado', 'Mayor o Menor', 'Preguntados', 'Generala Simple'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private gameDataService: GameDataService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);

    const generosGroup: Record<string, boolean[]> = {};
    this.generos.forEach(g => { generosGroup[g] = [false]; });

    this.form = this.fb.group({
      nombreApellido: ['', [Validators.required, Validators.minLength(3)]],
      edad: [null, [Validators.required, Validators.min(18), Validators.max(99)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{1,10}$')]],
      frecuenciaJuego: ['', Validators.required],
      generosJuegos: this.fb.group(generosGroup, { validators: atLeastOneGenero }),
      juegoFavorito: ['', Validators.required],
      sugerencia: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  get f() { return this.form.controls; }
  get generosCtrl() { return this.form.get('generosJuegos') as FormGroup; }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.successMsg = '';
    this.errorMsg = '';

    if (this.form.invalid) return;
    if (!this.currentUser) {
      this.errorMsg = 'Debés estar logueado para responder la encuesta.';
      return;
    }

    this.loading = true;
    try {
      const val = this.form.value;
      const selectedGeneros: string[] = this.generos.filter(g => val.generosJuegos[g]);

      await this.gameDataService.saveSurveyResult({
        uid: this.currentUser.uid,
        email: this.currentUser.email ?? '',
        nombreApellido: val.nombreApellido.trim(),
        edad: Number(val.edad),
        telefono: val.telefono,
        frecuenciaJuego: val.frecuenciaJuego,
        generosJuegos: selectedGeneros,
        juegoFavorito: val.juegoFavorito,
        sugerencia: val.sugerencia.trim()
      });

      this.successMsg = '¡Encuesta enviada con éxito! Gracias por tu participación.';
      this.form.reset();
      this.submitted = false;
    } catch (e) {
      this.errorMsg = 'Ocurrió un error al enviar la encuesta. Intentá de nuevo.';
    } finally {
      this.loading = false;
    }
  }
}
