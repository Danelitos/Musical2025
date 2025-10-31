import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieConsent } from './cookie-consent';

describe('CookieConsent', () => {
  let component: CookieConsent;
  let fixture: ComponentFixture<CookieConsent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookieConsent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookieConsent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show banner if no consent in localStorage', () => {
    localStorage.removeItem('cookieConsent');
    component = new CookieConsent();
    setTimeout(() => {
      expect(component['showBanner']()).toBe(true);
    }, 600);
  });

  it('should accept cookies', () => {
    component['acceptCookies']();
    expect(localStorage.getItem('cookieConsent')).toBe('accepted');
    expect(component['showBanner']()).toBe(false);
  });

  it('should reject cookies', () => {
    component['rejectCookies']();
    expect(localStorage.getItem('cookieConsent')).toBe('rejected');
    expect(component['showBanner']()).toBe(false);
  });
});
