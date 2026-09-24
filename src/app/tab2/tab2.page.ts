import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonNote, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, close, createOutline, informationCircleOutline, searchOutline, star, starOutline, trashOutline, tvOutline } from 'ionicons/icons';
import { SeriesDraft, SeriesEntry, SeriesStatus } from '../models/series.model';
import { SeriesService } from '../services/series.service';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

const nonBlankValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() ? null : { blank: true };

const ratingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.value === null || (Number.isInteger(control.value) && control.value >= 1 && control.value <= 5)
    ? null : { invalidRating: true };

const optionalPositiveIntegerValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value === null || control.value === '') return null;
  const value = Number(control.value);
  return Number.isInteger(value) && value > 0 ? null : { positiveInteger: true };
};

const seriesProgressValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const totalSeasons = toOptionalNumber(control.get('totalSeasons')?.value);
  const currentSeason = toOptionalNumber(control.get('currentSeason')?.value);
  const lastEpisode = toOptionalNumber(control.get('lastEpisode')?.value);
  const startDate = control.get('startDate')?.value as string;
  const finishDate = control.get('finishDate')?.value as string;
  const errors: ValidationErrors = {};

  if (totalSeasons !== null && currentSeason !== null && currentSeason > totalSeasons) {
    errors['seasonExceedsTotal'] = true;
  }
  if (lastEpisode !== null && currentSeason === null) errors['episodeWithoutSeason'] = true;
  if (startDate && finishDate && finishDate < startDate) errors['invalidDateRange'] = true;
  return Object.keys(errors).length ? errors : null;
};

function toOptionalNumber(value: unknown): number | null {
  return value === null || value === '' ? null : Number(value);
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [CommonModule, ReactiveFormsModule, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonNote, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar],
})
export class Tab2Page {
  private readonly seriesService = inject(SeriesService);
  private readonly alertController = inject(AlertController);
  readonly series = this.seriesService.series;
  readonly searchTerm = signal('');
  readonly sortOption = signal<SortOption>('newest');
  readonly isFormOpen = signal(false);
  readonly isDetailsOpen = signal(false);
  readonly selectedSeries = signal<SeriesEntry | null>(null);
  readonly editingSeriesId = signal<string | null>(null);
  readonly filteredSeries = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    const results = this.series().filter((entry) => entry.title.toLocaleLowerCase().includes(term));
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
  readonly seriesForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [nonBlankValidator] }),
    creator: new FormControl('', { nonNullable: true }),
    genre: new FormControl('', { nonNullable: true }),
    rating: new FormControl<number | null>(null, { validators: [ratingValidator] }),
    status: new FormControl<SeriesStatus>('En progreso', { nonNullable: true }),
    totalSeasons: new FormControl<number | null>(null, { validators: [optionalPositiveIntegerValidator] }),
    currentSeason: new FormControl<number | null>(null, { validators: [optionalPositiveIntegerValidator] }),
    lastEpisode: new FormControl<number | null>(null, { validators: [optionalPositiveIntegerValidator] }),
    startDate: new FormControl('', { nonNullable: true }),
    finishDate: new FormControl('', { nonNullable: true }),
    opinion: new FormControl('', { nonNullable: true }),
    favoriteQuote: new FormControl('', { nonNullable: true }),
  }, { validators: [seriesProgressValidator] });

  constructor() {
    addIcons({ add, close, createOutline, informationCircleOutline, searchOutline, star, starOutline, trashOutline, tvOutline });
  }

  setSearchTerm(event: CustomEvent<{ value?: string | null }>): void { this.searchTerm.set(event.detail.value ?? ''); }
  setSortOption(event: CustomEvent<{ value: SortOption }>): void { this.sortOption.set(event.detail.value); }
  openAddForm(): void { this.editingSeriesId.set(null); this.resetForm(); this.isFormOpen.set(true); }
  openEditForm(entry: SeriesEntry): void {
    this.editingSeriesId.set(entry.id);
    this.seriesForm.reset({
      title: entry.title, creator: entry.creator, genre: entry.genre, rating: entry.rating,
      status: entry.status, totalSeasons: entry.totalSeasons, currentSeason: entry.currentSeason,
      lastEpisode: entry.lastEpisode, startDate: entry.startDate, finishDate: entry.finishDate,
      opinion: entry.opinion, favoriteQuote: entry.favoriteQuote,
    });
    this.isDetailsOpen.set(false);
    this.isFormOpen.set(true);
  }
  closeForm(): void { this.isFormOpen.set(false); this.resetForm(); }
  saveSeries(): void {
    this.seriesForm.markAllAsTouched();
    if (this.seriesForm.invalid) return;
    const value = this.seriesForm.getRawValue();
    const draft: SeriesDraft = {
      title: value.title.trim(), creator: value.creator.trim(), genre: value.genre.trim(),
      rating: value.rating, status: value.status, totalSeasons: toOptionalNumber(value.totalSeasons),
      currentSeason: toOptionalNumber(value.currentSeason), lastEpisode: toOptionalNumber(value.lastEpisode),
      startDate: value.startDate, finishDate: value.finishDate, opinion: value.opinion.trim(),
      favoriteQuote: value.favoriteQuote.trim(),
    };
    const editingId = this.editingSeriesId();
    if (editingId) this.seriesService.updateSeries(editingId, draft);
    else this.seriesService.addSeries(draft);
    this.closeForm();
  }
  openDetails(entry: SeriesEntry): void { this.selectedSeries.set(entry); this.isDetailsOpen.set(true); }
  closeDetails(): void { this.isDetailsOpen.set(false); this.selectedSeries.set(null); }
  async confirmDelete(entry: SeriesEntry): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar serie', message: `¿Estás seguro de que deseas eliminar «${entry.title}»?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => {
          this.seriesService.deleteSeries(entry.id);
          if (this.selectedSeries()?.id === entry.id) this.closeDetails();
        } },
      ],
    });
    await alert.present();
  }
  setRating(rating: number | null): void { this.seriesForm.controls.rating.setValue(rating); }
  isRatingSelected(rating: number): boolean { return (this.seriesForm.controls.rating.value ?? 0) >= rating; }
  progressLabel(entry: SeriesEntry): string {
    if (entry.currentSeason !== null && entry.lastEpisode !== null) return `Temporada ${entry.currentSeason} · Episodio ${entry.lastEpisode}`;
    if (entry.currentSeason !== null && entry.totalSeasons !== null) return `${entry.currentSeason} de ${entry.totalSeasons} temporadas`;
    if (entry.currentSeason !== null) return `Temporada ${entry.currentSeason}`;
    if (entry.totalSeasons !== null) return `${entry.totalSeasons} temporadas`;
    return '';
  }
  formatDate(date: string): string {
    const normalized = date.length === 10 ? `${date}T12:00:00` : date;
    return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(normalized));
  }
  private resetForm(): void {
    this.seriesForm.reset({
      title: '', creator: '', genre: '', rating: null, status: 'En progreso', totalSeasons: null,
      currentSeason: null, lastEpisode: null, startDate: '', finishDate: '', opinion: '', favoriteQuote: '',
    });
  }
}
