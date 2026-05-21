import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { Subscription, firstValueFrom } from 'rxjs';
import { AuthService } from '../auth.service';
import { GameDataService } from '../services/game-data.service';

interface OpenTdbResponse {
  response_code: number;
  results: OpenTdbQuestion[];
}

interface OpenTdbQuestion {
  category: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface TriviaQuestion {
  category: string;
  difficulty: string;
  question: string;
  answers: string[];
  correctAnswer: string;
}

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preguntados.component.html',
  styleUrl: './preguntados.component.css'
})
export class PreguntadosComponent implements OnInit, OnDestroy {
  private readonly apiUrl = 'https://opentdb.com/api.php?amount=10&type=multiple';

  user: User | null = null;
  userName = 'Jugador';

  loading = true;
  loadError = '';

  questions: TriviaQuestion[] = [];
  currentIndex = 0;
  score = 0;

  selectedAnswer = '';
  answerChecked = false;
  gameFinished = false;
  statusMessage = '';

  private startTime = Date.now();
  private resultSaved = false;
  private userSub?: Subscription;

  constructor(
    private readonly http: HttpClient,
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

    await this.loadQuestions();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  get currentQuestion(): TriviaQuestion | null {
    if (this.currentIndex >= this.questions.length) {
      return null;
    }
    return this.questions[this.currentIndex];
  }

  get progressLabel(): string {
    return `${this.currentIndex + 1} / ${this.questions.length}`;
  }

  async restartGame(): Promise<void> {
    await this.loadQuestions();
  }

  selectAnswer(answer: string): void {
    if (this.answerChecked || this.gameFinished) {
      return;
    }

    this.selectedAnswer = answer;
    this.answerChecked = true;

    if (answer === this.currentQuestion?.correctAnswer) {
      this.score++;
      this.statusMessage = 'Correcto.';
    } else {
      this.statusMessage = `Incorrecto. La respuesta correcta era: ${this.currentQuestion?.correctAnswer ?? ''}`;
    }
  }

  async nextQuestion(): Promise<void> {
    if (!this.answerChecked || this.gameFinished) {
      return;
    }

    this.currentIndex++;
    this.selectedAnswer = '';
    this.answerChecked = false;
    this.statusMessage = '';

    if (this.currentIndex >= this.questions.length) {
      this.gameFinished = true;
      this.statusMessage = `Partida finalizada. Aciertos: ${this.score} de ${this.questions.length}.`;
      await this.persistResult();
    }
  }

  private async loadQuestions(): Promise<void> {
    this.loading = true;
    this.loadError = '';
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.selectedAnswer = '';
    this.answerChecked = false;
    this.gameFinished = false;
    this.statusMessage = '';
    this.resultSaved = false;
    this.startTime = Date.now();

    try {
      const response = await firstValueFrom(this.http.get<OpenTdbResponse>(this.apiUrl));
      if (!response || !response.results || response.results.length === 0) {
        throw new Error('Sin preguntas disponibles en este momento.');
      }

      this.questions = response.results.map((item) => {
        const correct = this.decodeHtml(item.correct_answer);
        const wrong = item.incorrect_answers.map((answer) => this.decodeHtml(answer));

        return {
          category: this.decodeHtml(item.category),
          difficulty: this.decodeHtml(item.difficulty),
          question: this.decodeHtml(item.question),
          answers: this.shuffle([correct, ...wrong]),
          correctAnswer: correct
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudieron cargar las preguntas.';
      this.loadError = message;
    } finally {
      this.loading = false;
    }
  }

  private shuffle(values: string[]): string[] {
    const shuffled = [...values];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private decodeHtml(value: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(value, 'text/html');
    return doc.documentElement.textContent ?? value;
  }

  private async persistResult(): Promise<void> {
    if (!this.user || this.resultSaved) {
      return;
    }

    this.resultSaved = true;
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

    await this.gameDataService.saveTriviaResult({
      uid: this.user.uid,
      email: this.user.email ?? '',
      nombre: this.userName || 'Jugador',
      aciertos: this.score,
      totalPreguntas: this.questions.length,
      tiempoSegundos: elapsedSeconds
    });
  }
}
