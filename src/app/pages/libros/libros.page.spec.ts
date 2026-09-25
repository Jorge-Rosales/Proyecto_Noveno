import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { Book } from '../../models/book.model';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/book.service';
import { LibrosPage } from './libros.page';

describe('LibrosPage', () => {
  let component: LibrosPage;
  let fixture: ComponentFixture<LibrosPage>;
  let bookService: jasmine.SpyObj<BookService>;
  const book: Book = {
    id: 'book-1', title: 'Libro de prueba', author: 'Autora', genre: 'Ensayo', rating: 4,
    status: 'Terminado', startDate: '2026-01-01', finishDate: '2026-01-02', opinion: '',
    favoriteQuote: '', createdAt: '2026-01-03 10:00:00', updatedAt: '2026-01-03 10:00:00',
  };

  beforeEach(async () => {
    bookService = jasmine.createSpyObj<BookService>('BookService', [
      'listarLibros', 'crearLibro', 'actualizarLibro', 'eliminarLibro',
    ]);
    bookService.listarLibros.and.resolveTo([]);
    await TestBed.configureTestingModule({
      imports: [LibrosPage],
      providers: [
        provideZonelessChangeDetection(), provideIonicAngular(), provideRouter([]),
        { provide: AuthService, useValue: jasmine.createSpyObj<AuthService>('AuthService', ['cerrarSesion']) },
        { provide: BookService, useValue: bookService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LibrosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga la lista persistente al entrar', async () => {
    bookService.listarLibros.and.resolveTo([book]);
    await component.ionViewWillEnter();
    expect(component.books()).toEqual([book]);
  });

  it('crea y refresca la lista mediante el servicio', async () => {
    bookService.crearLibro.and.resolveTo(book);
    bookService.listarLibros.and.resolveTo([book]);
    component.openAddForm();
    component.bookForm.patchValue({ title: ' Libro de prueba ', author: 'Autora' });
    await component.saveBook();
    expect(bookService.crearLibro).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'Libro de prueba' }));
    expect(component.books()).toEqual([book]);
    expect(component.isFormOpen()).toBeFalse();
  });

  it('edita conservando el identificador y refresca la lista', async () => {
    const updated = { ...book, title: 'Libro actualizado' };
    component.books.set([book]);
    bookService.actualizarLibro.and.resolveTo(updated);
    bookService.listarLibros.and.resolveTo([updated]);
    component.openEditForm(book);
    component.bookForm.controls.title.setValue('Libro actualizado');
    await component.saveBook();
    expect(bookService.actualizarLibro).toHaveBeenCalledWith(jasmine.objectContaining({ id: book.id, title: 'Libro actualizado' }));
    expect(component.books()).toEqual([updated]);
  });

  it('elimina en el backend antes de refrescar la lista', async () => {
    component.books.set([book]);
    bookService.eliminarLibro.and.resolveTo();
    bookService.listarLibros.and.resolveTo([]);
    await (component as unknown as { deletePersistedBook(value: Book): Promise<void> }).deletePersistedBook(book);
    expect(bookService.eliminarLibro).toHaveBeenCalledWith(book.id);
    expect(component.books()).toEqual([]);
  });

  it('no intenta crear un título compuesto solo por espacios', async () => {
    component.bookForm.controls.title.setValue('   ');
    await component.saveBook();
    expect(bookService.crearLibro).not.toHaveBeenCalled();
    expect(component.bookForm.controls.title.hasError('blank')).toBeTrue();
  });
});
