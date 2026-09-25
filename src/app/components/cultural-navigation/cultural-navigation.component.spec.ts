import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { CulturalNavigationComponent } from './cultural-navigation.component';

describe('CulturalNavigationComponent', () => {
  let component: CulturalNavigationComponent;
  let fixture: ComponentFixture<CulturalNavigationComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['cerrarSesion']);
    authService.cerrarSesion.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [CulturalNavigationComponent],
      providers: [
        provideZonelessChangeDetection(), provideIonicAngular(), provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture = TestBed.createComponent(CulturalNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea', () => {
    expect(component).toBeTruthy();
  });

  it('cierra la sesión y navega al login', async () => {
    await component.closeSession();
    expect(authService.cerrarSesion).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login', { replaceUrl: true });
  });
});
