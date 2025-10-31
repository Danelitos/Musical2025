import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Cookie } from 'lucide-angular';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.scss'
})
export class CookieConsent {
  protected readonly showBanner = signal(false);
  protected readonly Cookie = Cookie;

  constructor() {
    this.checkCookieConsent();
  }

  private checkCookieConsent(): void {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Mostrar el banner después de un pequeño delay para mejor UX
      setTimeout(() => {
        this.showBanner.set(true);
      }, 500);
    }
  }

  protected acceptCookies(): void {
    localStorage.setItem('cookieConsent', 'accepted');
    this.showBanner.set(false);
  }

  protected rejectCookies(): void {
    localStorage.setItem('cookieConsent', 'rejected');
    this.showBanner.set(false);
  }
}
