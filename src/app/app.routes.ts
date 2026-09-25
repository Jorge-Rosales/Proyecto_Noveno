import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'libros',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/libros/libros.page').then((m) => m.LibrosPage),
  },
  {
    path: 'series',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/series/series.page').then((m) => m.SeriesPage),
  },
  {
    path: 'peliculas',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/peliculas/peliculas.page').then((m) => m.PeliculasPage),
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
