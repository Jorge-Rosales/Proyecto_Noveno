import { TestBed } from '@angular/core/testing';
import { Book } from '../models/book.model';
import { BookService } from './book.service';

describe('BookService', () => {
  let service: BookService;
  const draft: Omit<Book, 'id' | 'createdAt' | 'updatedAt'> = {
    title: 'Libro de prueba',
    author: '',
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
    service = TestBed.inject(BookService);
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-01-01T12:00:00.000Z'));
  });

  afterEach(() => jasmine.clock().uninstall());

  it('creates records with unique identifiers and valid timestamps', () => {
    const first = service.addBook(draft);
    const second = service.addBook({ ...draft, title: 'Otro libro' });

    expect(first.id).not.toBe(second.id);
    expect(Number.isNaN(Date.parse(first.createdAt))).toBeFalse();
    expect(first.updatedAt).toBe(first.createdAt);
    expect(service.books().map((book) => book.id)).toEqual([second.id, first.id]);
  });

  it('updates and deletes only the selected book', () => {
    const first = service.addBook(draft);
    const second = service.addBook({ ...draft, title: 'Otro libro' });
    const originalCreatedAt = first.createdAt;

    jasmine.clock().mockDate(new Date('2026-01-02T12:00:00.000Z'));
    service.updateBook(first.id, { ...draft, title: 'Libro actualizado' });
    const updated = service.books().find((book) => book.id === first.id);
    expect(updated?.title).toBe('Libro actualizado');
    expect(updated?.createdAt).toBe(originalCreatedAt);
    expect(updated?.updatedAt).toBe('2026-01-02T12:00:00.000Z');
    expect(updated?.id).toBe(first.id);
    expect(service.books().find((book) => book.id === second.id)?.title).toBe('Otro libro');

    service.deleteBook(first.id);
    expect(service.books().map((book) => book.id)).toEqual([second.id]);
  });
});
