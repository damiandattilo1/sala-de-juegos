import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MyMemoryResponse } from '../models/my-memory-response.model';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly apiUrl = 'https://api.mymemory.translated.net/get';
  private readonly cache = new Map<string, string>();

  constructor(private readonly http: HttpClient) {}

  async translateMany(values: string[], from = 'en', to = 'es'): Promise<string[]> {
    const uniqueValues = Array.from(new Set(values));

    for (const value of uniqueValues) {
      const key = this.getCacheKey(value, from, to);
      if (this.cache.has(key)) {
        continue;
      }

      const translated = await this.translateSingle(value, from, to);
      this.cache.set(key, translated);
    }

    return values.map((value) => {
      const key = this.getCacheKey(value, from, to);
      return this.cache.get(key) ?? value;
    });
  }

  private async translateSingle(value: string, from: string, to: string): Promise<string> {
    const trimmed = value.trim();
    if (!trimmed) {
      return value;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<MyMemoryResponse>(this.apiUrl, {
          params: {
            q: value,
            langpair: `${from}|${to}`
          }
        })
      );

      const translated = response.responseData?.translatedText?.trim();
      return translated || value;
    } catch {
      return value;
    }
  }

  private getCacheKey(value: string, from: string, to: string): string {
    return `${from}|${to}|${value}`;
  }
}