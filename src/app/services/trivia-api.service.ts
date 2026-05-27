import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OpenTdbResponse } from '../models/open-tdb-response.model';
import { OpenTdbQuestion } from '../models/open-tdb-question.model';

export type { OpenTdbResponse, OpenTdbQuestion };

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