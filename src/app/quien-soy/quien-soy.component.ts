import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GitHubProfile } from '../models/github-profile.model';
import { ImporterService } from '../services/importer.service';

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

  constructor(private importerService: ImporterService) {}

  ngOnInit() {
    this.importerService.importGitHubProfile(this.githubUsername)
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
