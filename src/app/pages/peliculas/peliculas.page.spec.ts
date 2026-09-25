import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { MovieEntry } from '../../models/movie.model';
import { AuthService } from '../../services/auth.service';
import { MovieService } from '../../services/movie.service';
import { PeliculasPage } from './peliculas.page';

describe('PeliculasPage', () => {
  let component: PeliculasPage;
  let fixture: ComponentFixture<PeliculasPage>;
  let movieService: jasmine.SpyObj<MovieService>;
  const movie: MovieEntry = {
    id: 'movie-1', title: 'Película de prueba', director: 'Directora', genre: 'Drama', rating: 5,
    status: 'Terminado', startDate: '2026-01-01', finishDate: '2026-01-01', opinion: '',
    favoriteQuote: '', createdAt: '2026-01-03 10:00:00', updatedAt: '2026-01-03 10:00:00',
  };

  beforeEach(async () => {
    movieService = jasmine.createSpyObj<MovieService>('MovieService', ['listarPeliculas', 'crearPelicula', 'actualizarPelicula', 'eliminarPelicula']);
    movieService.listarPeliculas.and.resolveTo([]);
    await TestBed.configureTestingModule({
      imports: [PeliculasPage],
      providers: [
        provideZonelessChangeDetection(), provideIonicAngular(), provideRouter([]),
        { provide: AuthService, useValue: jasmine.createSpyObj<AuthService>('AuthService', ['cerrarSesion']) },
        { provide: MovieService, useValue: movieService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PeliculasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga la lista persistente al entrar', async () => {
    movieService.listarPeliculas.and.resolveTo([movie]);
    await component.ionViewWillEnter();
    expect(component.movies()).toEqual([movie]);
  });

  it('crea y refresca la lista mediante el servicio', async () => {
    movieService.crearPelicula.and.resolveTo(movie);
    movieService.listarPeliculas.and.resolveTo([movie]);
    component.openAddForm();
    component.movieForm.patchValue({ title: ' Película de prueba ', director: 'Directora' });
    await component.saveMovie();
    expect(movieService.crearPelicula).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'Película de prueba' }));
    expect(component.movies()).toEqual([movie]);
  });

  it('edita conservando el identificador', async () => {
    const updated = { ...movie, title: 'Película actualizada' };
    component.movies.set([movie]);
    movieService.actualizarPelicula.and.resolveTo(updated);
    movieService.listarPeliculas.and.resolveTo([updated]);
    component.openEditForm(movie);
    component.movieForm.controls.title.setValue('Película actualizada');
    await component.saveMovie();
    expect(movieService.actualizarPelicula).toHaveBeenCalledWith(jasmine.objectContaining({ id: movie.id, title: 'Película actualizada' }));
    expect(component.movies()).toEqual([updated]);
  });

  it('elimina en el backend antes de refrescar la lista', async () => {
    component.movies.set([movie]);
    movieService.eliminarPelicula.and.resolveTo();
    movieService.listarPeliculas.and.resolveTo([]);
    await (component as unknown as { deletePersistedMovie(value: MovieEntry): Promise<void> }).deletePersistedMovie(movie);
    expect(movieService.eliminarPelicula).toHaveBeenCalledWith(movie.id);
    expect(component.movies()).toEqual([]);
  });

  it('rechaza una fecha final anterior a la inicial', () => {
    component.movieForm.patchValue({ title: 'Película', startDate: '2026-05-10', finishDate: '2026-05-09' });
    expect(component.movieForm.hasError('invalidDateRange')).toBeTrue();
  });
});
