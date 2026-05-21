import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { GameDataService } from '../services/game-data.service';
import { TranslationService } from '../services/translation.service';
import { TriviaApiService } from '../services/trivia-api.service';

interface TriviaQuestion {
  category: string;
  difficulty: string;
  question: string;
  answers: string[];
  correctAnswer: string;
}

interface PreparedQuestion {
  category: string;
  difficulty: string;
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
}

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preguntados.component.html',
  styleUrl: './preguntados.component.css'
})
export class PreguntadosComponent implements OnInit, OnDestroy {
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
    private readonly authService: AuthService,
    private readonly gameDataService: GameDataService,
    private readonly translationService: TranslationService,
    private readonly triviaApiService: TriviaApiService
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
      const response = await this.triviaApiService.getMultipleChoiceQuestions(10, 'easy');
      if (!response || !response.results || response.results.length === 0) {
        throw new Error('Sin preguntas disponibles en este momento.');
      }

      const preparedQuestions: PreparedQuestion[] = response.results.map((item) => ({
        category: this.normalizeText(item.category),
        difficulty: this.normalizeText(item.difficulty),
        question: this.normalizeText(item.question),
        correctAnswer: this.normalizeText(item.correct_answer),
        wrongAnswers: item.incorrect_answers.map((answer) => this.normalizeText(answer))
      }));

      const valuesToTranslate = preparedQuestions.flatMap((item) => [
        item.category,
        item.difficulty,
        item.question,
        item.correctAnswer,
        ...item.wrongAnswers
      ]);

      const translatedValues = await this.translationService.translateMany(valuesToTranslate, 'en', 'es');
      let translatedIndex = 0;

      this.questions = preparedQuestions.map((_) => {
          const category = this.normalizeText(translatedValues[translatedIndex++] ?? '');
          const difficulty = this.normalizeText(translatedValues[translatedIndex++] ?? '');
          const question = this.normalizeText(translatedValues[translatedIndex++] ?? '');
          const correctAnswer = this.normalizeText(translatedValues[translatedIndex++] ?? '');
        const wrongAnswers = [
            this.normalizeText(translatedValues[translatedIndex++] ?? ''),
            this.normalizeText(translatedValues[translatedIndex++] ?? ''),
            this.normalizeText(translatedValues[translatedIndex++] ?? '')
        ];

        return {
          category,
          difficulty,
          question,
          answers: this.shuffle([correctAnswer, ...wrongAnswers]),
          correctAnswer
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

  private normalizeText(value: string): string {
    return this.decodeHtml(value)
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
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
