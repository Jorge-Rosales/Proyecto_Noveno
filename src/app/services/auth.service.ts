import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';
import { api } from './api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private redirectingToLogin = false;

  constructor() {
    api.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (
          axios.isAxiosError(error)
          && error.response?.status === 401
          && !this.isAuthenticationCheck(error.config?.url)
        ) {
          await this.redirectToLogin();
        }

        return Promise.reject(error);
      },
    );
  }

  async iniciarSesion(email: string, contrasena: string): Promise<unknown> {
    const respuesta = await api.post('/login.php', { email, contrasena });
    return respuesta.data;
  }

  async comprobarSesion(): Promise<unknown> {
    const respuesta = await api.get('/sesion.php');
    return respuesta.data;
  }

  async obtenerCsrfToken(): Promise<string> {
    const respuesta = await api.get<{ csrf_token?: unknown }>('/csrf-token.php');
    const token = respuesta.data?.csrf_token;

    if (typeof token !== 'string' || !token.trim()) {
      throw new Error('La API no devolvió un token CSRF válido.');
    }

    return token;
  }

  async cerrarSesion(): Promise<void> {
    const token = await this.obtenerCsrfToken();
    await api.post('/logout.php', undefined, {
      headers: {
        'X-CSRF-Token': token,
      },
    });
  }

  private isAuthenticationCheck(url?: string): boolean {
    if (!url) return false;
    const path = url.split('?')[0];
    return path.endsWith('/sesion.php') || path.endsWith('/login.php');
  }

  private async redirectToLogin(): Promise<void> {
    if (this.redirectingToLogin || this.router.url.startsWith('/login')) return;

    this.redirectingToLogin = true;
    try {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    } finally {
      this.redirectingToLogin = false;
    }
  }

}
