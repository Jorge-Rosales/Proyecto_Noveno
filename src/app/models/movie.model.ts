export type MovieStatus = 'En progreso' | 'Terminado' | 'Abandonado';

export interface MovieEntry {
  id: string;
  title: string;
  director: string;
  genre: string;
  rating: number | null;
  status: MovieStatus;
  startDate: string;
  finishDate: string;
  opinion: string;
  favoriteQuote: string;
  createdAt: string;
  updatedAt: string;
}

export type MovieDraft = Omit<MovieEntry, 'id' | 'createdAt' | 'updatedAt'>;
