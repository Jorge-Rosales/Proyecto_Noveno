import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';

import { Tab2Page } from './tab2.page';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab2Page],
      providers: [provideZonelessChangeDetection(), provideIonicAngular()],
    }).compileComponents();

    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects a title made only of spaces', () => {
    component.seriesForm.controls.title.setValue('   ');
    component.saveSeries();

    expect(component.seriesForm.controls.title.hasError('blank')).toBeTrue();
    expect(component.series().length).toBe(0);
  });

  it('rejects invalid season progress', () => {
    component.seriesForm.patchValue({
      title: 'Una serie',
      totalSeasons: 2,
      currentSeason: 3,
    });

    expect(component.seriesForm.hasError('seasonExceedsTotal')).toBeTrue();
  });

  it('requires a current season when an episode is provided', () => {
    component.seriesForm.patchValue({ title: 'Una serie', lastEpisode: 4 });

    expect(component.seriesForm.hasError('episodeWithoutSeason')).toBeTrue();
  });

  it('creates and edits the same series without duplicating it', () => {
    component.seriesForm.patchValue({ title: 'Título inicial', currentSeason: 1, lastEpisode: 2 });
    component.saveSeries();
    const created = component.series()[0];

    component.openEditForm(created);
    component.seriesForm.controls.title.setValue('Título actualizado');
    component.saveSeries();

    expect(component.series().length).toBe(1);
    expect(component.series()[0].id).toBe(created.id);
    expect(component.series()[0].title).toBe('Título actualizado');
  });

  it('does not change the original series when editing is cancelled', () => {
    component.seriesForm.patchValue({ title: 'Título original', currentSeason: 1 });
    component.saveSeries();
    const created = component.series()[0];

    component.openEditForm(created);
    component.seriesForm.controls.title.setValue('Cambio descartado');
    component.closeForm();

    expect(component.series()[0].title).toBe('Título original');
  });

  it('combines case-insensitive search and rating order', () => {
    component.seriesForm.patchValue({ title: 'Serie Beta', rating: 2 });
    component.saveSeries();
    component.openAddForm();
    component.seriesForm.patchValue({ title: 'SERIE Alfa', rating: 5 });
    component.saveSeries();

    component.searchTerm.set('serie');
    component.sortOption.set('lowest');

    expect(component.filteredSeries().map((entry) => entry.title)).toEqual(['Serie Beta', 'SERIE Alfa']);
    expect(component.series().map((entry) => entry.title)).toEqual(['SERIE Alfa', 'Serie Beta']);
  });
});
