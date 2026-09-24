import { Injectable, signal } from '@angular/core';
import { SeriesDraft, SeriesEntry } from '../models/series.model';

@Injectable({ providedIn: 'root' })
export class SeriesService {
  private readonly seriesList = signal<SeriesEntry[]>([]);
  readonly series = this.seriesList.asReadonly();

  addSeries(draft: SeriesDraft): SeriesEntry {
    const now = new Date().toISOString();
    const entry: SeriesEntry = { ...draft, id: this.createId(), createdAt: now, updatedAt: now };
    this.seriesList.update((series) => [entry, ...series]);
    return entry;
  }

  updateSeries(id: string, changes: SeriesDraft): void {
    this.seriesList.update((series) =>
      series.map((entry) =>
        entry.id === id ? { ...entry, ...changes, updatedAt: new Date().toISOString() } : entry,
      ),
    );
  }

  deleteSeries(id: string): void {
    this.seriesList.update((series) => series.filter((entry) => entry.id !== id));
  }

  private createId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  }
}
