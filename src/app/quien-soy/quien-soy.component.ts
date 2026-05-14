import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface GitHubProfile {
  name: string;
  login: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  location: string;
  blog: string;
}

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quien-soy.component.html',
  styleUrl: './quien-soy.component.css'
})
export class QuienSoyComponent implements OnInit {
  githubUser: GitHubProfile | null = null;
  loading = true;
  error = '';
  readonly githubUsername = 'damiandattilo1';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<GitHubProfile>(`https://api.github.com/users/${this.githubUsername}`)
      .subscribe({
        next: (data) => {
          this.githubUser = data;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo cargar el perfil de GitHub.';
          this.loading = false;
        }
      });
  }
}
