import { Injectable } from '@angular/core';
import { api } from './api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

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

}