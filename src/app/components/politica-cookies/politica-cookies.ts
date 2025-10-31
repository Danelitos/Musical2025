import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Cookie } from 'lucide-angular';

@Component({
  selector: 'app-politica-cookies',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule, MatButtonModule, RouterLink, LucideAngularModule],
  templateUrl: './politica-cookies.html',
  styleUrl: './politica-cookies.scss'
})
export class PoliticaCookies {
  readonly Cookie = Cookie;

  /**
   * Vuelve al inicio recargando la página completa
   */
  volverAlInicio() {
    window.location.href = '/';
  }
}
