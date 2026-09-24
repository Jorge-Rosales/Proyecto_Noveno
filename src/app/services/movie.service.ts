import { Injectable, signal } from '@angular/core';
import { MovieDraft, MovieEntry } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly movieList = signal<MovieEntry[]>([]);
  readonly movies = this.movieList.asReadonly();

  addMovie(draft: MovieDraft): MovieEntry {
    const now = new Date().toISOString();
    const movie: MovieEntry = { ...draft, id: this.createId(), createdAt: now, updatedAt: now };
    this.movieList.update((movies) => [movie, ...movies]);
    return movie;
  }

  updateMovie(id: string, changes: MovieDraft): void {
    this.movieList.update((movies) =>
      movies.map((movie) =>
        movie.id === id ? { ...movie, ...changes, updatedAt: new Date().toISOString() } : movie,
      ),
    );
  }

  deleteMovie(id: string): void {
    this.movieList.update((movies) => movies.filter((movie) => movie.id !== id));
  }

  private createId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  }
}
