import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface OpenTdbResponse {
  response_code: number;
  results: OpenTdbQuestion[];
}

export interface OpenTdbQuestion {
  category: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

@Injectable({ providedIn: 'root' })
export class TriviaApiService {
  private readonly baseUrl = 'https://opentdb.com/api.php';

  constructor(private readonly http: HttpClient) {}

  async getMultipleChoiceQuestions(amount = 10, difficulty = 'easy'): Promise<OpenTdbResponse> {
    return firstValueFrom(
      this.http.get<OpenTdbResponse>(this.baseUrl, {
        params: {
          amount,
          difficulty,
          type: 'multiple'
        }
      })
    );
  }
}