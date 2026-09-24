import { TestBed } from '@angular/core/testing';
import { MovieDraft } from '../models/movie.model';
import { MovieService } from './movie.service';

describe('MovieService', () => {
  let service: MovieService;
  const draft: MovieDraft = {
    title: 'Película de prueba',
    director: '',
    genre: '',
    rating: null,
    status: 'En progreso',
    startDate: '',
    finishDate: '',
    opinion: '',
    favoriteQuote: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovieService);
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-01-01T12:00:00.000Z'));
  });

  afterEach(() => jasmine.clock().uninstall());

  it('creates, updates and deletes only the selected movie', () => {
    const first = service.addMovie(draft);
    const second = service.addMovie({ ...draft, title: 'Otra película' });

    expect(first.id).not.toBe(second.id);
    expect(Number.isNaN(Date.parse(first.createdAt))).toBeFalse();
    expect(first.updatedAt).toBe(first.createdAt);

    jasmine.clock().mockDate(new Date('2026-01-02T12:00:00.000Z'));
    service.updateMovie(first.id, { ...draft, title: 'Película actualizada' });
    const updated = service.movies().find((movie) => movie.id === first.id);
    expect(updated?.title).toBe('Película actualizada');
    expect(updated?.createdAt).toBe(first.createdAt);
    expect(updated?.updatedAt).toBe('2026-01-02T12:00:00.000Z');
    expect(updated?.id).toBe(first.id);
    expect(service.movies().find((movie) => movie.id === second.id)?.title).toBe('Otra película');

    service.deleteMovie(first.id);
    expect(service.movies().map((movie) => movie.id)).toEqual([second.id]);
  });
});
