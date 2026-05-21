import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { GameDataService } from '../services/game-data.service';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.css'
})
export class AhorcadoComponent implements OnInit, OnDestroy {
  private readonly words = [
    'ANGULAR',
    'FIREBASE',
    'PROGRAMACION',
    'COMPONENTE',
    'JAVASCRIPT',
    'TYPESCRIPT',
    'AHORCADO',
    'SERVICIO',
    'ROUTER',
    'AUTENTICACION'
  ];

  readonly alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  readonly maxErrors = 6;

  user: User | null = null;
  userName = 'Jugador';

  secretWord = '';
  selectedLetters = new Set<string>();
  wrongAttempts = 0;
  gameFinished = false;
  won = false;
  statusMessage = '';

  private startTime = Date.now();
  private resultSaved = false;
  private userSub?: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly gameDataService: GameDataService
  ) {}

  async ngOnInit(): Promise<void> {
    this.userSub = this.authService.currentUser$.subscribe(async (user) => {
      this.user = user;
      if (user) {
        this.userName = await this.authService.getNombreUsuario(user.uid);
      } else {
        this.userName = 'Jugador';
      }
    });

    this.startNewGame();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  get maskedWord(): string {
    return this.secretWord
      .split('')
      .map((letter) => (this.selectedLetters.has(letter) ? letter : '_'))
      .join(' ');
  }

  get remainingAttempts(): number {
    return this.maxErrors - this.wrongAttempts;
  }

  isLetterUsed(letter: string): boolean {
    return this.selectedLetters.has(letter) || this.gameFinished;
  }

  async selectLetter(letter: string): Promise<void> {
    if (this.selectedLetters.has(letter) || this.gameFinished) {
      return;
    }

    this.selectedLetters.add(letter);

    if (!this.secretWord.includes(letter)) {
      this.wrongAttempts++;
    }

    if (this.didPlayerWin()) {
      this.gameFinished = true;
      this.won = true;
      this.statusMessage = 'Excelente. Adivinaste la palabra.';
      await this.persistResult();
      return;
    }

    if (this.wrongAttempts >= this.maxErrors) {
      this.gameFinished = true;
      this.won = false;
      this.statusMessage = `Perdiste. La palabra era: ${this.secretWord}`;
      await this.persistResult();
    }
  }

  startNewGame(): void {
    this.secretWord = this.words[Math.floor(Math.random() * this.words.length)];
    this.selectedLetters = new Set<string>();
    this.wrongAttempts = 0;
    this.gameFinished = false;
    this.won = false;
    this.statusMessage = '';
    this.startTime = Date.now();
    this.resultSaved = false;
  }

  private didPlayerWin(): boolean {
    return this.secretWord.split('').every((letter) => this.selectedLetters.has(letter));
  }

  private async persistResult(): Promise<void> {
    if (!this.user || this.resultSaved) {
      return;
    }

    this.resultSaved = true;
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

    await this.gameDataService.saveHangmanResult({
      uid: this.user.uid,
      email: this.user.email ?? '',
      nombre: this.userName || 'Jugador',
      palabra: this.secretWord,
      gano: this.won,
      tiempoSegundos: elapsedSeconds,
      letrasSeleccionadas: this.selectedLetters.size
    });
  }
}
