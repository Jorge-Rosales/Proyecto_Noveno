import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';

import { Tab3Page } from './tab3.page';

describe('Tab3Page', () => {
  let component: Tab3Page;
  let fixture: ComponentFixture<Tab3Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab3Page],
      providers: [provideZonelessChangeDetection(), provideIonicAngular()],
    }).compileComponents();

    fixture = TestBed.createComponent(Tab3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects a title made only of spaces', () => {
    component.movieForm.controls.title.setValue('   ');
    component.saveMovie();

    expect(component.movieForm.controls.title.hasError('blank')).toBeTrue();
    expect(component.movies().length).toBe(0);
  });

  it('rejects an earlier finish date and accepts the same day', () => {
    component.movieForm.patchValue({ title: 'Película', startDate: '2026-05-10', finishDate: '2026-05-09' });
    expect(component.movieForm.hasError('invalidDateRange')).toBeTrue();

    component.movieForm.controls.finishDate.setValue('2026-05-10');
    expect(component.movieForm.valid).toBeTrue();
  });

  it('creates and edits the same movie without duplicating it', () => {
    component.movieForm.patchValue({ title: 'Título inicial', director: 'Dirección original' });
    component.saveMovie();
    const created = component.movies()[0];

    component.openEditForm(created);
    component.movieForm.patchValue({ title: 'Título actualizado', rating: 5 });
    component.saveMovie();

    expect(component.movies().length).toBe(1);
    expect(component.movies()[0].id).toBe(created.id);
    expect(component.movies()[0].title).toBe('Título actualizado');
    expect(component.movies()[0].rating).toBe(5);
  });

  it('does not change the original movie when editing is cancelled', () => {
    component.movieForm.patchValue({ title: 'Título original', director: 'Directora' });
    component.saveMovie();
    const created = component.movies()[0];

    component.openEditForm(created);
    component.movieForm.controls.title.setValue('Cambio descartado');
    component.closeForm();

    expect(component.movies()[0].title).toBe('Título original');
  });

  it('combines trimmed case-insensitive search and rating order', () => {
    component.movieForm.patchValue({ title: 'Película Beta', rating: 2 });
    component.saveMovie();
    component.openAddForm();
    component.movieForm.patchValue({ title: 'PELÍCULA Alfa', rating: 5 });
    component.saveMovie();

    component.searchTerm.set('  película  ');
    component.sortOption.set('lowest');

    expect(component.filteredMovies().map((movie) => movie.title)).toEqual(['Película Beta', 'PELÍCULA Alfa']);
    expect(component.movies().map((movie) => movie.title)).toEqual(['PELÍCULA Alfa', 'Película Beta']);
  });
});
