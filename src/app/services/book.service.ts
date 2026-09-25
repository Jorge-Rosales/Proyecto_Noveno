import { inject, Injectable, signal } from '@angular/core';
import { Book } from '../models/book.model';
import { api } from './api';
import { AuthService } from './auth.service';

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

interface BookResponse {
  libro: PhpBook;
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly authService = inject(AuthService);
  private readonly bookList = signal<Book[]>([]);
  readonly books = this.bookList.asReadonly();

  async listarLibros(): Promise<Book[]> {
    const response = await api.get<ListBooksResponse>('/libros/listar.php');

    return response.data.libros.map((book) => this.mapPhpBook(book));
  }

  async crearLibro(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
    const token = await this.authService.obtenerCsrfToken();
    const response = await api.post<BookResponse>('/libros/crear.php', this.mapBookToPhp(book), {
      headers: {
        'X-CSRF-Token': token,
      },
    });

    return this.mapPhpBook(response.data.libro);
  }

  async actualizarLibro(book: Book): Promise<Book> {
    const token = await this.authService.obtenerCsrfToken();
    const data = {
      id: book.id,
      ...this.mapBookToPhp(book),
    };
    const response = await api.put<BookResponse>('/libros/actualizar.php', data, {
      headers: {
        'X-CSRF-Token': token,
      },
    });

    return this.mapPhpBook(response.data.libro);
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

  private mapPhpBook(book: PhpBook): Book {
    return {
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
    };
  }

  private mapBookToPhp(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) {
    return {
      titulo: book.title,
      autor: book.author || null,
      genero: book.genre || null,
      calificacion: book.rating,
      estado: book.status,
      fecha_inicio: book.startDate || null,
      fecha_finalizacion: book.finishDate || null,
      opinion: book.opinion || null,
      frase_favorita: book.favoriteQuote || null,
    };
  }

  private createId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  }
}