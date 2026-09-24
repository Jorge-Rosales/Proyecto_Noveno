import { Injectable, signal } from '@angular/core';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly bookList = signal<Book[]>([]);
  readonly books = this.bookList.asReadonly();

  addBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Book {
    const now = new Date().toISOString();
    const newBook: Book = {
      ...book,
      id: this.createId(),
      createdAt: now,
      updatedAt: now,
    };

    this.bookList.update((books) => [newBook, ...books]);
    return newBook;
  }

  updateBook(id: string, changes: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.bookList.update((books) =>
      books.map((book) =>
        book.id === id
          ? { ...book, ...changes, updatedAt: new Date().toISOString() }
          : book,
      ),
    );
  }

  deleteBook(id: string): void {
    this.bookList.update((books) => books.filter((book) => book.id !== id));
  }

  private createId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  }
}