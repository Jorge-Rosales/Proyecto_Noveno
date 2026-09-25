import { inject, Injectable } from '@angular/core';
import { SeriesDraft, SeriesEntry } from '../models/series.model';
import { api } from './api';
import { AuthService } from './auth.service';

interface PhpSeries {
  id: string | number;
  titulo: string;
  creador: string | null;
  genero: string | null;
  calificacion: number | string | null;
  estado: SeriesEntry['status'];
  total_temporadas: number | string | null;
  temporada_actual: number | string | null;
  ultimo_episodio: number | string | null;
  fecha_inicio: string | null;
  fecha_finalizacion: string | null;
  opinion: string | null;
  frase_favorita: string | null;
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;
}

interface ListSeriesResponse {
  series: PhpSeries[];
}

interface SeriesResponse {
  serie: PhpSeries;
}

@Injectable({ providedIn: 'root' })
export class SeriesService {
  private readonly authService = inject(AuthService);

  async listarSeries(): Promise<SeriesEntry[]> {
    const response = await api.get<ListSeriesResponse>('/series/listar.php');
    return (response.data.series ?? []).map((series) => this.mapPhpSeries(series));
  }

  async crearSerie(series: SeriesDraft): Promise<SeriesEntry> {
    const csrfToken = await this.authService.obtenerCsrfToken();
    const response = await api.post<SeriesResponse>(
      '/series/crear.php',
      this.mapSeriesToPhp(series),
      { headers: { 'X-CSRF-Token': csrfToken } },
    );
    return this.mapPhpSeries(response.data.serie);
  }

  async actualizarSerie(series: SeriesEntry): Promise<SeriesEntry> {
    const csrfToken = await this.authService.obtenerCsrfToken();
    const response = await api.put<SeriesResponse>(
      '/series/actualizar.php',
      { id: series.id, ...this.mapSeriesToPhp(series) },
      { headers: { 'X-CSRF-Token': csrfToken } },
    );
    return this.mapPhpSeries(response.data.serie);
  }

  async eliminarSerie(id: string): Promise<void> {
    if (typeof id !== 'string' || !id.trim()) throw new Error('El id de la serie es obligatorio.');
    const csrfToken = await this.authService.obtenerCsrfToken();
    await api.delete('/series/eliminar.php', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: { id: id.trim() },
    });
  }

  private mapPhpSeries(series: PhpSeries): SeriesEntry {
    return {
      id: String(series.id),
      title: series.titulo,
      creator: series.creador ?? '',
      genre: series.genero ?? '',
      rating: this.toNullableNumber(series.calificacion),
      status: series.estado,
      totalSeasons: this.toNullableNumber(series.total_temporadas),
      currentSeason: this.toNullableNumber(series.temporada_actual),
      lastEpisode: this.toNullableNumber(series.ultimo_episodio),
      startDate: series.fecha_inicio ?? '',
      finishDate: series.fecha_finalizacion ?? '',
      opinion: series.opinion ?? '',
      favoriteQuote: series.frase_favorita ?? '',
      createdAt: series.fecha_creacion ?? '',
      updatedAt: series.fecha_actualizacion ?? series.fecha_creacion ?? '',
    };
  }

  private mapSeriesToPhp(series: SeriesDraft): Record<string, string | number | null> {
    return {
      titulo: series.title,
      creador: this.toNullableText(series.creator),
      genero: this.toNullableText(series.genre),
      calificacion: series.rating,
      estado: series.status,
      total_temporadas: series.totalSeasons,
      temporada_actual: series.currentSeason,
      ultimo_episodio: series.lastEpisode,
      fecha_inicio: this.toNullableText(series.startDate),
      fecha_finalizacion: this.toNullableText(series.finishDate),
      opinion: this.toNullableText(series.opinion),
      frase_favorita: this.toNullableText(series.favoriteQuote),
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
