import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { GameDataService } from '../services/game-data.service';

interface RoundScore {
  label: string;
  points: number;
}

@Component({
  selector: 'app-generala-simple',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generala-simple.component.html',
  styleUrl: './generala-simple.component.css'
})
export class GeneralaSimpleComponent implements OnInit, OnDestroy {
  readonly maxRounds = 10;
  readonly targetScore = 200;

  user: User | null = null;
  userName = 'Jugador';

  currentRound = 0;
  playerDice: number[] = [];
  cpuDice: number[] = [];
  playerPoints = 0;
  cpuPoints = 0;

  playerCombo = '';
  cpuCombo = '';
  statusMessage = 'Tira los dados para comenzar la partida.';
  gameFinished = false;
  won = false;

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

    this.startGame();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  async rollRound(): Promise<void> {
    if (this.gameFinished) {
      return;
    }

    this.currentRound++;
    this.playerDice = this.rollDice(5);
    this.cpuDice = this.rollDice(5);

    const playerResult = this.calculateScore(this.playerDice);
    const cpuResult = this.calculateScore(this.cpuDice);

    this.playerCombo = playerResult.label;
    this.cpuCombo = cpuResult.label;

    this.playerPoints += playerResult.points;
    this.cpuPoints += cpuResult.points;

    this.statusMessage = `Ronda ${this.currentRound}: Jugador ${playerResult.label} (${playerResult.points}) vs CPU ${cpuResult.label} (${cpuResult.points}).`;

    if (this.playerPoints >= this.targetScore || this.cpuPoints >= this.targetScore || this.currentRound >= this.maxRounds) {
      this.gameFinished = true;
      this.won = this.playerPoints > this.cpuPoints;

      if (this.playerPoints === this.cpuPoints) {
        this.statusMessage = `Empate en ${this.currentRound} rondas. Marcador final: ${this.playerPoints} - ${this.cpuPoints}.`;
      } else if (this.won) {
        this.statusMessage = `Ganaste. Marcador final: ${this.playerPoints} - ${this.cpuPoints}.`;
      } else {
        this.statusMessage = `Perdiste. Marcador final: ${this.playerPoints} - ${this.cpuPoints}.`;
      }

      await this.persistResult();
    }
  }

  startGame(): void {
    this.currentRound = 0;
    this.playerDice = [];
    this.cpuDice = [];
    this.playerPoints = 0;
    this.cpuPoints = 0;
    this.playerCombo = '';
    this.cpuCombo = '';
    this.statusMessage = 'Tira los dados para comenzar la partida.';
    this.gameFinished = false;
    this.won = false;
    this.resultSaved = false;
  }

  private rollDice(count: number): number[] {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
  }

  private calculateScore(dice: number[]): RoundScore {
    const frequency = new Map<number, number>();
    for (const value of dice) {
      frequency.set(value, (frequency.get(value) ?? 0) + 1);
    }

    const counts = Array.from(frequency.values()).sort((a, b) => b - a);

    if (counts[0] === 5) {
      return { label: 'Generala', points: 100 };
    }

    if (counts[0] === 4) {
      return { label: 'Poker', points: 80 };
    }

    if (counts[0] === 3 && counts[1] === 2) {
      return { label: 'Full', points: 50 };
    }

    return { label: 'Sin juego', points: 10 };
  }

  private async persistResult(): Promise<void> {
    if (!this.user || this.resultSaved) {
      return;
    }

    this.resultSaved = true;
    await this.gameDataService.saveGeneralaResult({
      uid: this.user.uid,
      email: this.user.email ?? '',
      nombre: this.userName || 'Jugador',
      puntosJugador: this.playerPoints,
      puntosCpu: this.cpuPoints,
      rondasJugadas: this.currentRound,
      gano: this.won
    });
  }
}
