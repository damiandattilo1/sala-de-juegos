import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameDataService, SurveyResult } from '../services/game-data.service';

export interface ChartItem {
  label: string;
  count: number;
}

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
  activeTab: 'indicadores' | 'registros' = 'indicadores';
  private unsubscribe?: () => void;

  readonly FRECUENCIAS = ['Nunca', 'A veces', 'Frecuentemente', 'Siempre'];
  readonly JUEGOS = ['Ahorcado', 'Mayor o Menor', 'Preguntados', 'Generala Simple'];
  readonly GENEROS = ['Acción', 'Estrategia', 'Trivia', 'Deportes', 'Aventura'];
  readonly CHART_COLORS = ['#a78bfa', '#818cf8', '#60a5fa', '#34d399', '#f59e0b', '#fb7185'];

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

  get totalRespuestas(): number { return this.surveys.length; }

  get edadPromedio(): number {
    if (!this.surveys.length) return 0;
    return Math.round(this.surveys.reduce((acc, s) => acc + (Number(s.edad) || 0), 0) / this.surveys.length);
  }

  get edadMin(): number {
    if (!this.surveys.length) return 0;
    return Math.min(...this.surveys.map(s => Number(s.edad) || 0));
  }

  get edadMax(): number {
    if (!this.surveys.length) return 0;
    return Math.max(...this.surveys.map(s => Number(s.edad) || 0));
  }

  get frecuenciaData(): ChartItem[] {
    return this.FRECUENCIAS.map(opt => ({
      label: opt,
      count: this.surveys.filter(s => s.frecuenciaJuego === opt).length
    }));
  }

  get juegoFavData(): ChartItem[] {
    return this.JUEGOS.map(opt => ({
      label: opt,
      count: this.surveys.filter(s => s.juegoFavorito === opt).length
    }));
  }

  get generosData(): ChartItem[] {
    return this.GENEROS.map(g => ({
      label: g,
      count: this.surveys.filter(s => s.generosJuegos?.includes(g)).length
    }));
  }

  maxOf(data: ChartItem[]): number {
    return Math.max(...data.map(d => d.count), 1);
  }

  barWidth(count: number, max: number): number {
    return Math.round((count / max) * 290);
  }

  svgHeight(rows: number): number {
    return rows * 44 + 20;
  }

  chartColor(index: number): string {
    return this.CHART_COLORS[index % this.CHART_COLORS.length];
  }

  formatGeneros(generos: string[]): string {
    return generos?.join(', ') ?? '—';
  }

  formatDate(ts: any): string {
    if (!ts) return '—';
    const d: Date = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
