import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonNote, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular';
import axios from 'axios';
import { addIcons } from 'ionicons';
import { add, bookOutline, close, createOutline, informationCircleOutline, libraryOutline, searchOutline, star, starOutline, trashOutline } from 'ionicons/icons';
import { Book, ReadingStatus } from '../models/book.model';
import { BookService } from '../services/book.service';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startDate = control.get('startDate')?.value as string;
  const finishDate = control.get('finishDate')?.value as string;
  return startDate && finishDate && finishDate < startDate ? { invalidDateRange: true } : null;
};

const nonBlankValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() ? null : { blank: true };

const ratingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.value === null || (Number.isInteger(control.value) && control.value >= 1 && control.value <= 5)
    ? null : { invalidRating: true };

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [CommonModule, ReactiveFormsModule, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonNote, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar],
})
export class Tab1Page {
  private readonly bookService = inject(BookService);
  private readonly alertController = inject(AlertController);
  readonly books = signal<Book[]>(this.bookService.books());
  readonly searchTerm = signal('');
  readonly sortOption = signal<SortOption>('newest');
  readonly isFormOpen = signal(false);
  readonly isDetailsOpen = signal(false);
  readonly selectedBook = signal<Book | null>(null);
  readonly editingBookId = signal<string | null>(null);
  readonly statuses: ReadingStatus[] = ['En progreso', 'Terminado', 'Abandonado'];
  readonly filteredBooks = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    const books = this.books().filter((book) => book.title.toLocaleLowerCase().includes(term));
    return [...books].sort((first, second) => {
      if (this.sortOption() === 'highest' || this.sortOption() === 'lowest') {
        if (first.rating === null) return second.rating === null ? 0 : 1;
        if (second.rating === null) return -1;
        return this.sortOption() === 'highest' ? second.rating - first.rating : first.rating - second.rating;
      }
      const firstDate = new Date(first.createdAt).getTime();
      const secondDate = new Date(second.createdAt).getTime();
      return this.sortOption() === 'newest' ? secondDate - firstDate : firstDate - secondDate;
    });
  });
  readonly bookForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [nonBlankValidator] }),
    author: new FormControl('', { nonNullable: true }),
    genre: new FormControl('', { nonNullable: true }),
    rating: new FormControl<number | null>(null, { validators: [ratingValidator] }),
    status: new FormControl<ReadingStatus>('En progreso', { nonNullable: true }),
    startDate: new FormControl('', { nonNullable: true }),
    finishDate: new FormControl('', { nonNullable: true }),
    opinion: new FormControl('', { nonNullable: true }),
    favoriteQuote: new FormControl('', { nonNullable: true }),
  }, { validators: dateRangeValidator });

  constructor() {
    addIcons({ add, bookOutline, close, createOutline, informationCircleOutline, libraryOutline, searchOutline, star, starOutline, trashOutline });
  }

  async ionViewWillEnter(): Promise<void> {
    try {
      const books = await this.bookService.listarLibros();
      this.books.set(books);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error al consultar los libros:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return;
      }

      console.error('Error inesperado al consultar los libros:', {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  setSearchTerm(event: CustomEvent<{ value?: string | null }>): void { this.searchTerm.set(event.detail.value ?? ''); }
  setSortOption(event: CustomEvent<{ value: SortOption }>): void { this.sortOption.set(event.detail.value); }
  openAddForm(): void { this.editingBookId.set(null); this.resetForm(); this.isFormOpen.set(true); }
  openEditForm(book: Book): void {
    this.editingBookId.set(book.id);
    this.bookForm.reset({ title: book.title, author: book.author, genre: book.genre, rating: book.rating, status: book.status, startDate: book.startDate, finishDate: book.finishDate, opinion: book.opinion, favoriteQuote: book.favoriteQuote });
    this.isDetailsOpen.set(false);
    this.isFormOpen.set(true);
  }
  closeForm(): void { this.isFormOpen.set(false); this.resetForm(); }
  async saveBook(): Promise<void> {
    this.bookForm.markAllAsTouched();
    if (this.bookForm.invalid) return;
    const value = this.bookForm.getRawValue();
    const bookData = { title: value.title.trim(), author: value.author.trim(), genre: value.genre.trim(), rating: value.rating, status: value.status, startDate: value.startDate, finishDate: value.finishDate, opinion: value.opinion.trim(), favoriteQuote: value.favoriteQuote.trim() };
    const editingId = this.editingBookId();
    if (editingId) {
      this.bookService.updateBook(editingId, bookData);
      this.books.update((books) => books.map((book) =>
        book.id === editingId
          ? { ...book, ...bookData, updatedAt: new Date().toISOString() }
          : book,
      ));
      this.closeForm();
      return;
    }

    try {
      await this.bookService.crearLibro(bookData);
      const books = await this.bookService.listarLibros();
      this.books.set(books);
      this.closeForm();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error al crear el libro:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return;
      }

      console.error('Error inesperado al crear el libro:', {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  openDetails(book: Book): void { this.selectedBook.set(book); this.isDetailsOpen.set(true); }
  closeDetails(): void { this.isDetailsOpen.set(false); this.selectedBook.set(null); }
  async confirmDelete(book: Book): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar libro',
      message: `¿Estás seguro de que deseas eliminar «${book.title}»?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => {
          this.bookService.deleteBook(book.id);
          this.books.update((books) => books.filter((entry) => entry.id !== book.id));
          if (this.selectedBook()?.id === book.id) this.closeDetails();
        } },
      ],
    });
    await alert.present();
  }
  setRating(rating: number | null): void { this.bookForm.controls.rating.setValue(rating); }
  isRatingSelected(rating: number): boolean { return (this.bookForm.controls.rating.value ?? 0) >= rating; }
  formatDate(date: string): string {
    const normalized = date.length === 10 ? `${date}T12:00:00` : date;
    return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(normalized));
  }
  private resetForm(): void {
    this.bookForm.reset({ title: '', author: '', genre: '', rating: null, status: 'En progreso', startDate: '', finishDate: '', opinion: '', favoriteQuote: '' });
  }
}
