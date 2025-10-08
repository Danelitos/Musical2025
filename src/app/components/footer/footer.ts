import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  currentYear = new Date().getFullYear();
  
  socialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com/belendeJudaMusical',
      icon: 'facebook'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/belendeJudaMusical',
      icon: 'instagram'
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@belendeJudaMusical',
      icon: 'video_library'
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@belendeJudaMusical',
      icon: 'play_circle'
    }
  ];
  
  legalLinks = [
    {
      name: 'Política de Privacidad',
      url: '/politica-privacidad'
    },
    {
      name: 'Términos y Condiciones',
      url: '/terminos-condiciones'
    },
    {
      name: 'Política de Cookies',
      url: '/politica-cookies'
    },
    {
      name: 'Contacto',
      url: '/contacto'
    }
  ];
  
  openSocialLink(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
