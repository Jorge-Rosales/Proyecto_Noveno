import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular';
import axios from 'axios';
import { addIcons } from 'ionicons';
import { bookOutline, filmOutline, logOutOutline, tvOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly isClosingSession = signal(false);

  constructor() {
    addIcons({ bookOutline, filmOutline, logOutOutline, tvOutline });
  }

  async closeSession(): Promise<void> {
    if (this.isClosingSession()) return;

    this.isClosingSession.set(true);
    try {
      await this.authService.cerrarSesion();
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('No fue posible cerrar la sesión:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error('No fue posible cerrar la sesión:', {
          message: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    } finally {
      this.isClosingSession.set(false);
    }
  }
}
