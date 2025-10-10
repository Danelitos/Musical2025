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
      name: 'Instagram',
      url: 'https://instagram.com/enbelendejuda',
      icon: 'photo_camera' // Instagram
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@enbelendejuda',
      icon: 'music_note' // TikTok
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@EnBel%C3%A9nDeJud%C3%A1',
      icon: 'smart_display' // YouTube
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
