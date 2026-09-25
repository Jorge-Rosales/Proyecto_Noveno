import { Injectable } from '@angular/core';
import { api } from './api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  async comprobarSesion(): Promise<unknown> {
    const respuesta = await api.get('/sesion.php');
    return respuesta.data;
  }

}