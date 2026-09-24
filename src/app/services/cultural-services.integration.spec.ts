import { TestBed } from '@angular/core/testing';
import { Book } from '../models/book.model';
import { MovieDraft } from '../models/movie.model';
import { SeriesDraft } from '../models/series.model';
import { BookService } from './book.service';
import { MovieService } from './movie.service';
import { SeriesService } from './series.service';

describe('Cultural data services independence', () => {
  const bookDraft: Omit<Book, 'id' | 'createdAt' | 'updatedAt'> = {
    title: 'Libro', author: '', genre: '', rating: null, status: 'En progreso',
    startDate: '', finishDate: '', opinion: '', favoriteQuote: '',
  };
  const seriesDraft: SeriesDraft = {
    title: 'Serie', creator: '', genre: '', rating: null, status: 'En progreso',
    totalSeasons: null, currentSeason: null, lastEpisode: null,
    startDate: '', finishDate: '', opinion: '', favoriteQuote: '',
  };
  const movieDraft: MovieDraft = {
    title: 'Película', director: '', genre: '', rating: null, status: 'En progreso',
    startDate: '', finishDate: '', opinion: '', favoriteQuote: '',
  };

  it('keeps books, series and movies in independent collections', () => {
    TestBed.configureTestingModule({});
    const books = TestBed.inject(BookService);
    const series = TestBed.inject(SeriesService);
    const movies = TestBed.inject(MovieService);
    const book = books.addBook(bookDraft);
    const seriesEntry = series.addSeries(seriesDraft);
    const movie = movies.addMovie(movieDraft);

    books.deleteBook(book.id);
    expect(books.books().length).toBe(0);
    expect(series.series().map((entry) => entry.id)).toEqual([seriesEntry.id]);
    expect(movies.movies().map((entry) => entry.id)).toEqual([movie.id]);

    series.updateSeries(seriesEntry.id, { ...seriesDraft, title: 'Serie actualizada' });
    expect(series.series()[0].title).toBe('Serie actualizada');
    expect(movies.movies()[0].title).toBe('Película');
  });
});
