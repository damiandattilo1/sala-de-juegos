import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { GameDataService } from '../services/game-data.service';

type GuessDirection = 'mayor' | 'menor';

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mayor-menor.component.html',
  styleUrl: './mayor-menor.component.css'
})
export class MayorMenorComponent implements OnInit, OnDestroy {
  user: User | null = null;
  userName = 'Jugador';

  currentCard: number | null = null;
  deck: number[] = [];

  aciertos = 0;
  rondas = 0;
  gameOver = false;
  won = false;
  statusMessage = 'Elegí si la siguiente carta será mayor o menor.';

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

  async guess(direction: GuessDirection): Promise<void> {
    if (this.gameOver || this.currentCard === null || this.deck.length === 0) {
      return;
    }

    const nextCard = this.deck.pop();
    if (nextCard === undefined) {
      return;
    }

    this.rondas++;
    const previousCard = this.currentCard;
    const correct = this.isGuessCorrect(direction, previousCard, nextCard);

    if (correct) {
      this.aciertos++;
      this.currentCard = nextCard;
      this.statusMessage = `Correcto. Nueva carta: ${nextCard}.`;

      if (this.deck.length === 0) {
        this.gameOver = true;
        this.won = true;
        this.statusMessage = `Excelente. Terminaste el mazo con ${this.aciertos} aciertos.`;
        await this.persistResult();
      }
      return;
    }

    this.currentCard = nextCard;
    this.gameOver = true;
    this.won = false;

    if (nextCard === previousCard) {
      this.statusMessage = `Empate (${nextCard}). Fin de partida.`;
    } else {
      this.statusMessage = `Fallaste. La carta fue ${nextCard}.`;
    }

    await this.persistResult();
  }

  startGame(): void {
    this.deck = this.buildAndShuffleDeck();
    this.currentCard = this.deck.pop() ?? null;
    this.aciertos = 0;
    this.rondas = 0;
    this.gameOver = false;
    this.won = false;
    this.resultSaved = false;
    this.statusMessage = 'Elegí si la siguiente carta será mayor o menor.';
  }

  private isGuessCorrect(direction: GuessDirection, current: number, next: number): boolean {
    if (next === current) {
      return false;
    }
    return direction === 'mayor' ? next > current : next < current;
  }

  private buildAndShuffleDeck(): number[] {
    const spanishValues = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
    const cards = spanishValues.flatMap((value) => [value, value, value, value]);

    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
  }

  private async persistResult(): Promise<void> {
    if (!this.user || this.resultSaved) {
      return;
    }

    this.resultSaved = true;
    await this.gameDataService.saveHigherLowerResult({
      uid: this.user.uid,
      email: this.user.email ?? '',
      nombre: this.userName || 'Jugador',
      aciertos: this.aciertos,
      rondasJugadas: this.rondas,
      gano: this.won
    });
  }
}
