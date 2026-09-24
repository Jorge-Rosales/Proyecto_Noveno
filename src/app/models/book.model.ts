export type ReadingStatus = 'En progreso' | 'Terminado' | 'Abandonado';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number | null;
  status: ReadingStatus;
  startDate: string;
  finishDate: string;
  opinion: string;
  favoriteQuote: string;
  createdAt: string;
  updatedAt: string;
}