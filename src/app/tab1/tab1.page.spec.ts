import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';

import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab1Page],
      providers: [provideZonelessChangeDetection(), provideIonicAngular()],
    }).compileComponents();

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects a title made only of spaces', () => {
    component.bookForm.controls.title.setValue('   ');
    component.saveBook();

    expect(component.bookForm.controls.title.hasError('blank')).toBeTrue();
    expect(component.books().length).toBe(0);
  });

  it('creates and edits the same book without duplicating it', () => {
    component.bookForm.patchValue({ title: 'Título inicial', author: 'Autora' });
    component.saveBook();
    const created = component.books()[0];

    component.openEditForm(created);
    component.bookForm.patchValue({ title: 'Título actualizado', rating: 4 });
    component.saveBook();

    expect(component.books().length).toBe(1);
    expect(component.books()[0].id).toBe(created.id);
    expect(component.books()[0].title).toBe('Título actualizado');
  });

  it('does not change the original book when editing is cancelled', () => {
    component.bookForm.patchValue({ title: 'Título original', author: 'Autora' });
    component.saveBook();
    const created = component.books()[0];

    component.openEditForm(created);
    component.bookForm.controls.title.setValue('Cambio descartado');
    component.closeForm();

    expect(component.books()[0].title).toBe('Título original');
  });

  it('filters and sorts without changing the original collection', () => {
    component.bookForm.patchValue({ title: 'Libro Beta', rating: 2 });
    component.saveBook();
    component.openAddForm();
    component.bookForm.patchValue({ title: 'LIBRO Alfa', rating: 5 });
    component.saveBook();

    component.searchTerm.set(' libro ');
    component.sortOption.set('lowest');

    expect(component.filteredBooks().map((book) => book.title)).toEqual(['Libro Beta', 'LIBRO Alfa']);
    expect(component.books().map((book) => book.title)).toEqual(['LIBRO Alfa', 'Libro Beta']);
  });
});
