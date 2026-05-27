import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  GameDataService,
  GeneralaResult,
  HangmanResult,
  HigherLowerResult,
  TriviaResult
} from '../services/game-data.service';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './resultados.component.html',
  styleUrl: './resultados.component.css'
})
export class ResultadosComponent implements OnInit, OnDestroy {
  hangmanResults: HangmanResult[] = [];
  higherLowerResults: HigherLowerResult[] = [];
  triviaResults: TriviaResult[] = [];
  generalaResults: GeneralaResult[] = [];

  errorMessage = '';

  private unsubscribers: Array<() => void> = [];

  constructor(private readonly gameDataService: GameDataService) {}

  ngOnInit(): void {
    this.unsubscribers.push(
      this.gameDataService.subscribeHangmanResults(
        (results) => {
          this.hangmanResults = [...results].sort((a, b) => {
            if (a.gano !== b.gano) {
              return Number(b.gano) - Number(a.gano);
            }
            if (a.tiempoSegundos !== b.tiempoSegundos) {
              return a.tiempoSegundos - b.tiempoSegundos;
            }
            return a.letrasSeleccionadas - b.letrasSeleccionadas;
          });
        },
        (error) => this.errorMessage = error
      )
    );

    this.unsubscribers.push(
      this.gameDataService.subscribeHigherLowerResults(
        (results) => {
          this.higherLowerResults = [...results].sort((a, b) => {
            if (a.aciertos !== b.aciertos) {
              return b.aciertos - a.aciertos;
            }
            return b.rondasJugadas - a.rondasJugadas;
          });
        },
        (error) => this.errorMessage = error
      )
    );

    this.unsubscribers.push(
      this.gameDataService.subscribeTriviaResults(
        (results) => {
          this.triviaResults = [...results].sort((a, b) => {
            if (a.aciertos !== b.aciertos) {
              return b.aciertos - a.aciertos;
            }
            return a.tiempoSegundos - b.tiempoSegundos;
          });
        },
        (error) => this.errorMessage = error
      )
    );

    this.unsubscribers.push(
      this.gameDataService.subscribeGeneralaResults(
        (results) => {
          this.generalaResults = [...results].sort((a, b) => {
            if (a.puntosJugador !== b.puntosJugador) {
              return b.puntosJugador - a.puntosJugador;
            }
            return a.rondasJugadas - b.rondasJugadas;
          });
        },
        (error) => this.errorMessage = error
      )
    );
  }

  toDate(ts: Timestamp | undefined): Date | null {
    return ts ? ts.toDate() : null;
  }

  ngOnDestroy(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
  }
}
