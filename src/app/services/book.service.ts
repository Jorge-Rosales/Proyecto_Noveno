import { Injectable, signal } from '@angular/core';
import { Book } from '../models/book.model';
import { api } from './api';

interface PhpBook {
  id: string | number;
  titulo: string;
  autor: string | null;
  genero: string | null;
  calificacion: number | string | null;
  estado: Book['status'];
  fecha_inicio: string | null;
  fecha_finalizacion: string | null;
  opinion: string | null;
  frase_favorita: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface ListBooksResponse {
  libros: PhpBook[];
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly bookList = signal<Book[]>([]);
  readonly books = this.bookList.asReadonly();

  async listarLibros(): Promise<Book[]> {
    const response = await api.get<ListBooksResponse>('/libros/listar.php');

    return response.data.libros.map((book) => ({
      id: String(book.id),
      title: book.titulo,
      author: book.autor ?? '',
      genre: book.genero ?? '',
      rating: book.calificacion === null ? null : Number(book.calificacion),
      status: book.estado,
      startDate: book.fecha_inicio ?? '',
      finishDate: book.fecha_finalizacion ?? '',
      opinion: book.opinion ?? '',
      favoriteQuote: book.frase_favorita ?? '',
      createdAt: book.fecha_creacion,
      updatedAt: book.fecha_actualizacion,
    }));
  }

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