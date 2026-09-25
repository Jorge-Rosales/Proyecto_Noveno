import { inject, Injectable, signal } from '@angular/core';
import { MovieDraft, MovieEntry } from '../models/movie.model';
import { api } from './api';
import { AuthService } from './auth.service';

interface PhpMovie {
  id: string | number;
  titulo: string;
  director: string | null;
  genero: string | null;
  calificacion: number | string | null;
  estado: MovieEntry['status'];
  fecha_inicio: string | null;
  fecha_finalizacion: string | null;
  opinion: string | null;
  frase_favorita: string | null;
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;
}

interface ListMoviesResponse {
  peliculas: PhpMovie[];
}

interface MovieResponse {
  pelicula: PhpMovie;
}

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly authService = inject(AuthService);
  private readonly movieList = signal<MovieEntry[]>([]);
  readonly movies = this.movieList.asReadonly();

  async listarPeliculas(): Promise<MovieEntry[]> {
    const response = await api.get<ListMoviesResponse>('/peliculas/listar.php');
    return (response.data.peliculas ?? []).map((movie) => this.mapPhpMovie(movie));
  }

  async crearPelicula(movie: MovieDraft): Promise<MovieEntry> {
    const csrfToken = await this.authService.obtenerCsrfToken();
    const response = await api.post<MovieResponse>(
      '/peliculas/crear.php',
      this.mapMovieToPhp(movie),
      { headers: { 'X-CSRF-Token': csrfToken } },
    );
    return this.mapPhpMovie(response.data.pelicula);
  }

  async actualizarPelicula(movie: MovieEntry): Promise<MovieEntry> {
    const csrfToken = await this.authService.obtenerCsrfToken();
    const response = await api.put<MovieResponse>(
      '/peliculas/actualizar.php',
      { id: movie.id, ...this.mapMovieToPhp(movie) },
      { headers: { 'X-CSRF-Token': csrfToken } },
    );
    return this.mapPhpMovie(response.data.pelicula);
  }

  async eliminarPelicula(id: string): Promise<void> {
    if (typeof id !== 'string' || !id.trim()) throw new Error('El id de la película es obligatorio.');
    const csrfToken = await this.authService.obtenerCsrfToken();
    await api.delete('/peliculas/eliminar.php', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: { id: id.trim() },
    });
  }

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

  private mapPhpMovie(movie: PhpMovie): MovieEntry {
    return {
      id: String(movie.id),
      title: movie.titulo,
      director: movie.director ?? '',
      genre: movie.genero ?? '',
      rating: this.toNullableNumber(movie.calificacion),
      status: movie.estado,
      startDate: movie.fecha_inicio ?? '',
      finishDate: movie.fecha_finalizacion ?? '',
      opinion: movie.opinion ?? '',
      favoriteQuote: movie.frase_favorita ?? '',
      createdAt: movie.fecha_creacion ?? '',
      updatedAt: movie.fecha_actualizacion ?? movie.fecha_creacion ?? '',
    };
  }

  private mapMovieToPhp(movie: MovieDraft): Record<string, string | number | null> {
    return {
      titulo: movie.title,
      director: this.toNullableText(movie.director),
      genero: this.toNullableText(movie.genre),
      calificacion: movie.rating,
      estado: movie.status,
      fecha_inicio: this.toNullableText(movie.startDate),
      fecha_finalizacion: this.toNullableText(movie.finishDate),
      opinion: this.toNullableText(movie.opinion),
      frase_favorita: this.toNullableText(movie.favoriteQuote),
    };
  }

  private toNullableNumber(value: number | string | null): number | null {
    if (value === null || value === '') return null;
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  private toNullableText(value: string): string | null {
    const normalizedValue = value.trim();
    return normalizedValue || null;
  }
}
