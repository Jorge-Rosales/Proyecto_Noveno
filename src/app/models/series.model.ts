export type SeriesStatus = 'En progreso' | 'Terminado' | 'Abandonado';

export interface SeriesEntry {
  id: string;
  title: string;
  creator: string;
  genre: string;
  rating: number | null;
  status: SeriesStatus;
  totalSeasons: number | null;
  currentSeason: number | null;
  lastEpisode: number | null;
  startDate: string;
  finishDate: string;
  opinion: string;
  favoriteQuote: string;
  createdAt: string;
  updatedAt: string;
}

export type SeriesDraft = Omit<SeriesEntry, 'id' | 'createdAt' | 'updatedAt'>;
