import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['comprobarSesion']);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authService }, { provide: Router, useValue: router }],
    });
  });

  it('permite navegar cuando la sesión es válida', async () => {
    authService.comprobarSesion.and.resolveTo({ autenticado: true });
    const result = await TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBeTrue();
  });

  it('redirige a login cuando la sesión es inválida', async () => {
    const loginTree = {} as UrlTree;
    authService.comprobarSesion.and.rejectWith(new Error('Sin sesión'));
    router.createUrlTree.and.returnValue(loginTree);
    const result = await TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(loginTree);
  });
});
