import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GitHubProfile } from '../models/github-profile.model';

@Injectable({
  providedIn: 'root'
})
export class ImporterService {
  private readonly baseUrl = 'https://api.github.com/users';

  constructor(private http: HttpClient) {}

  importGitHubProfile(username: string): Observable<GitHubProfile> {
    return this.http.get<GitHubProfile>(`${this.baseUrl}/${username}`);
  }
}
