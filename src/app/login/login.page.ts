import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonNote } from '@ionic/angular';
import axios from 'axios';
import { addIcons } from 'ionicons';
import { bookOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonNote,
    ReactiveFormsModule,
  ],
})
export class LoginPage {
  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  passwordVisible = false;
  serverMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    addIcons({ bookOutline, eyeOffOutline, eyeOutline });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  async submitLogin(): Promise<void> {
    this.serverMessage = '';

    const emailControl = this.loginForm.controls.email;
    const passwordControl = this.loginForm.controls.password;
    const email = emailControl.value.trim();
    const password = passwordControl.value;

    emailControl.setValue(email);
    if (!password.trim()) passwordControl.setErrors({ required: true });

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    try {
      await this.authService.iniciarSesion(email, password);
      this.serverMessage = 'Inicio de sesión correcto.';
      await this.confirmSession();
      await this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error de login.php:', {
          status: error.response?.status,
          message: error.message,
        });

        if (error.response?.status === 401 || error.response?.status === 403) {
          this.serverMessage = 'El correo o la contraseña son incorrectos.';
        } else if (!error.response) {
          this.serverMessage = 'No fue posible conectar con el servidor. Inténtalo de nuevo más tarde.';
        } else {
          this.serverMessage = 'No fue posible iniciar sesión. Inténtalo de nuevo más tarde.';
        }
        return;
      }

      console.error('Error inesperado al iniciar sesión:', {
        message: error instanceof Error ? error.message : String(error),
      });
      this.serverMessage = 'No fue posible iniciar sesión. Inténtalo de nuevo más tarde.';
    }
  }

  private async confirmSession(): Promise<void> {
    try {
      const respuesta = await this.authService.comprobarSesion();
      console.log('Sesion confirmada:', respuesta);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error al confirmar la sesión:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return;
      }

      console.error('Error al confirmar la sesión:', {
        status: undefined,
        data: undefined,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}