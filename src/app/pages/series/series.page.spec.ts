import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { SeriesEntry } from '../../models/series.model';
import { AuthService } from '../../services/auth.service';
import { SeriesService } from '../../services/series.service';
import { SeriesPage } from './series.page';

describe('SeriesPage', () => {
  let component: SeriesPage;
  let fixture: ComponentFixture<SeriesPage>;
  let seriesService: jasmine.SpyObj<SeriesService>;
  const series: SeriesEntry = {
    id: 'series-1', title: 'Serie de prueba', creator: 'Creadora', genre: 'Drama', rating: 5,
    status: 'En progreso', totalSeasons: 3, currentSeason: 2, lastEpisode: 4,
    startDate: '2026-01-01', finishDate: '', opinion: '', favoriteQuote: '',
    createdAt: '2026-01-03 10:00:00', updatedAt: '2026-01-03 10:00:00',
  };

  beforeEach(async () => {
    seriesService = jasmine.createSpyObj<SeriesService>('SeriesService', ['listarSeries', 'crearSerie', 'actualizarSerie', 'eliminarSerie']);
    seriesService.listarSeries.and.resolveTo([]);
    await TestBed.configureTestingModule({
      imports: [SeriesPage],
      providers: [
        provideZonelessChangeDetection(), provideIonicAngular(), provideRouter([]),
        { provide: AuthService, useValue: jasmine.createSpyObj<AuthService>('AuthService', ['cerrarSesion']) },
        { provide: SeriesService, useValue: seriesService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SeriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga la lista persistente al entrar', async () => {
    seriesService.listarSeries.and.resolveTo([series]);
    await component.ionViewWillEnter();
    expect(component.series()).toEqual([series]);
  });

  it('crea y refresca la lista mediante el servicio', async () => {
    seriesService.crearSerie.and.resolveTo(series);
    seriesService.listarSeries.and.resolveTo([series]);
    component.openAddForm();
    component.seriesForm.patchValue({ title: ' Serie de prueba ', currentSeason: 2, lastEpisode: 4 });
    await component.saveSeries();
    expect(seriesService.crearSerie).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'Serie de prueba' }));
    expect(component.series()).toEqual([series]);
  });

  it('edita conservando el identificador', async () => {
    const updated = { ...series, title: 'Serie actualizada' };
    component.series.set([series]);
    seriesService.actualizarSerie.and.resolveTo(updated);
    seriesService.listarSeries.and.resolveTo([updated]);
    component.openEditForm(series);
    component.seriesForm.controls.title.setValue('Serie actualizada');
    await component.saveSeries();
    expect(seriesService.actualizarSerie).toHaveBeenCalledWith(jasmine.objectContaining({ id: series.id, title: 'Serie actualizada' }));
    expect(component.series()).toEqual([updated]);
  });

  it('elimina en el backend antes de refrescar la lista', async () => {
    component.series.set([series]);
    seriesService.eliminarSerie.and.resolveTo();
    seriesService.listarSeries.and.resolveTo([]);
    await (component as unknown as { deletePersistedSeries(value: SeriesEntry): Promise<void> }).deletePersistedSeries(series);
    expect(seriesService.eliminarSerie).toHaveBeenCalledWith(series.id);
    expect(component.series()).toEqual([]);
  });

  it('rechaza progreso de temporadas inconsistente', () => {
    component.seriesForm.patchValue({ title: 'Serie', totalSeasons: 2, currentSeason: 3 });
    expect(component.seriesForm.hasError('seasonExceedsTotal')).toBeTrue();
  });
});
