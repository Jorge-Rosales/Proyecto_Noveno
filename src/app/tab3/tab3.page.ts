import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonNote, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, close, createOutline, filmOutline, informationCircleOutline, searchOutline, star, starOutline, trashOutline } from 'ionicons/icons';
import { MovieDraft, MovieEntry, MovieStatus } from '../models/movie.model';
import { MovieService } from '../services/movie.service';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

const nonBlankValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() ? null : { blank: true };

const ratingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.value === null || (Number.isInteger(control.value) && control.value >= 1 && control.value <= 5)
    ? null : { invalidRating: true };

const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startDate = control.get('startDate')?.value as string;
  const finishDate = control.get('finishDate')?.value as string;
  return startDate && finishDate && finishDate < startDate ? { invalidDateRange: true } : null;
};

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [CommonModule, ReactiveFormsModule, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonNote, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar],
})
export class Tab3Page {
  private readonly movieService = inject(MovieService);
  private readonly alertController = inject(AlertController);
  readonly movies = this.movieService.movies;
  readonly searchTerm = signal('');
  readonly sortOption = signal<SortOption>('newest');
  readonly isFormOpen = signal(false);
  readonly isDetailsOpen = signal(false);
  readonly selectedMovie = signal<MovieEntry | null>(null);
  readonly editingMovieId = signal<string | null>(null);
  readonly filteredMovies = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    const results = this.movies().filter((movie) => movie.title.toLocaleLowerCase().includes(term));
    return [...results].sort((first, second) => {
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
  readonly movieForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [nonBlankValidator] }),
    director: new FormControl('', { nonNullable: true }),
    genre: new FormControl('', { nonNullable: true }),
    rating: new FormControl<number | null>(null, { validators: [ratingValidator] }),
    status: new FormControl<MovieStatus>('En progreso', { nonNullable: true }),
    startDate: new FormControl('', { nonNullable: true }),
    finishDate: new FormControl('', { nonNullable: true }),
    opinion: new FormControl('', { nonNullable: true }),
    favoriteQuote: new FormControl('', { nonNullable: true }),
  }, { validators: [dateRangeValidator] });

  constructor() {
    addIcons({ add, close, createOutline, filmOutline, informationCircleOutline, searchOutline, star, starOutline, trashOutline });
  }

  setSearchTerm(event: CustomEvent<{ value?: string | null }>): void { this.searchTerm.set(event.detail.value ?? ''); }
  setSortOption(event: CustomEvent<{ value: SortOption }>): void { this.sortOption.set(event.detail.value); }
  openAddForm(): void { this.editingMovieId.set(null); this.resetForm(); this.isFormOpen.set(true); }
  openEditForm(movie: MovieEntry): void {
    this.editingMovieId.set(movie.id);
    this.movieForm.reset({
      title: movie.title, director: movie.director, genre: movie.genre, rating: movie.rating,
      status: movie.status, startDate: movie.startDate, finishDate: movie.finishDate,
      opinion: movie.opinion, favoriteQuote: movie.favoriteQuote,
    });
    this.isDetailsOpen.set(false);
    this.isFormOpen.set(true);
  }
  closeForm(): void { this.isFormOpen.set(false); this.resetForm(); }
  saveMovie(): void {
    this.movieForm.markAllAsTouched();
    if (this.movieForm.invalid) return;
    const value = this.movieForm.getRawValue();
    const draft: MovieDraft = {
      title: value.title.trim(), director: value.director.trim(), genre: value.genre.trim(),
      rating: value.rating, status: value.status, startDate: value.startDate, finishDate: value.finishDate,
      opinion: value.opinion.trim(), favoriteQuote: value.favoriteQuote.trim(),
    };
    const editingId = this.editingMovieId();
    if (editingId) this.movieService.updateMovie(editingId, draft);
    else this.movieService.addMovie(draft);
    this.closeForm();
  }
  openDetails(movie: MovieEntry): void { this.selectedMovie.set(movie); this.isDetailsOpen.set(true); }
  closeDetails(): void { this.isDetailsOpen.set(false); this.selectedMovie.set(null); }
  async confirmDelete(movie: MovieEntry): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar película', message: `¿Estás seguro de que deseas eliminar «${movie.title}»?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => {
          this.movieService.deleteMovie(movie.id);
          if (this.selectedMovie()?.id === movie.id) this.closeDetails();
        } },
      ],
    });
    await alert.present();
  }
  setRating(rating: number | null): void { this.movieForm.controls.rating.setValue(rating); }
  isRatingSelected(rating: number): boolean { return (this.movieForm.controls.rating.value ?? 0) >= rating; }
  formatDate(date: string): string {
    const normalized = date.length === 10 ? `${date}T12:00:00` : date;
    return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(normalized));
  }
  private resetForm(): void {
    this.movieForm.reset({
      title: '', director: '', genre: '', rating: null, status: 'En progreso', startDate: '',
      finishDate: '', opinion: '', favoriteQuote: '',
    });
  }
}
