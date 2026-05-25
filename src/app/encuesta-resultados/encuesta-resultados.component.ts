import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameDataService, SurveyResult } from '../services/game-data.service';

@Component({
  selector: 'app-encuesta-resultados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './encuesta-resultados.component.html',
  styleUrl: './encuesta-resultados.component.css'
})
export class EncuestaResultadosComponent implements OnInit, OnDestroy {
  surveys: SurveyResult[] = [];
  errorMsg = '';
  private unsubscribe?: () => void;

  constructor(private gameDataService: GameDataService) {}

  ngOnInit(): void {
    this.unsubscribe = this.gameDataService.subscribeSurveyResults(
      (results) => { this.surveys = results; },
      (err) => { this.errorMsg = err; }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }

  formatGeneros(generos: string[]): string {
    return generos?.join(', ') ?? '—';
  }
}
