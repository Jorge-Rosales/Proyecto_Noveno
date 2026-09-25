import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import axios, { AxiosHeaders } from 'axios';
import { AuthService } from '../services/auth.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['iniciarSesion']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    router.navigateByUrl.and.resolveTo(true);
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideZonelessChangeDetection(), provideIonicAngular(),
        { provide: AuthService, useValue: authService }, { provide: Router, useValue: router },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('navega a la biblioteca cuando el login es correcto', async () => {
    authService.iniciarSesion.and.resolveTo({ estado: 'correcto' });
    component.loginForm.setValue({ email: 'persona@example.com', password: 'secreto' });
    await component.submitLogin();
    expect(authService.iniciarSesion).toHaveBeenCalledWith('persona@example.com', 'secreto');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/libros', { replaceUrl: true });
  });

  it('muestra un mensaje comprensible ante credenciales incorrectas', async () => {
    authService.iniciarSesion.and.rejectWith(new axios.AxiosError(
      'Unauthorized', 'ERR_BAD_REQUEST', undefined, undefined,
      {
        status: 401,
        statusText: 'Unauthorized',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
        data: {},
      },
    ));
    component.loginForm.setValue({ email: 'persona@example.com', password: 'incorrecta' });
    await component.submitLogin();
    expect(component.serverMessage).toContain('incorrectos');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
