import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Vive la Magia de la Navidad en "En Belén de Judá"</h1>
          <p class="hero-tagline">Reserva tus entradas para el encantador musical navideño "En Belén de Judá"</p>
          <div class="hero-cta">
            <a routerLink="/seating" class="btn btn-accent">Reserva tus Entradas Ahora</a>
          </div>
        </div>
      </div>
    </div>
    
    <section class="container show-info">
      <div class="show-details">
        <h2>En Belén de Judá</h2>
        <p class="show-dates">En cartel durante la temporada navideña 2025</p>
        <p class="show-description">
          Sumérgete en la historia y el espíritu de la Navidad con "En Belén de Judá", un musical que celebra la alegría, la esperanza y la tradición. 
          Disfruta de canciones conmovedoras, actuaciones vibrantes y una experiencia inolvidable para toda la familia.
        </p>
        <div class="show-highlights">
          <div class="highlight">
            <h3>Reparto Festivo</h3>
            <p>Con talentos que llenan el escenario de alegría navideña</p>
          </div>
          <div class="highlight">
            <h3>Escenografía Mágica</h3>
            <p>Ambientes que transportan al corazón de Belén</p>
          </div>
          <div class="highlight">
            <h3>Música Emotiva</h3>
            <p>Melodías que capturan el espíritu de la Navidad</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="pricing-info container">
      <h2 class="text-center">Precio Único</h2>
      <div class="pricing-grid">
        <div class="pricing-card">
          <div class="section-name">Entrada General</div>
          <div class="section-price">10€</div>
          <ul class="section-details">
            <li>Acceso a todo el teatro</li>
            <li>Precio único para todos los asientos</li>
            <li>Disfruta del espectáculo navideño</li>
          </ul>
        </div>
      </div>
      
      <div class="booking-cta text-center">
        <a routerLink="/seating" class="btn btn-primary">Ver Plano de Asientos</a>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                  url('https://images.pexels.com/photos/11968312/pexels-photo-11968312.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');
      background-size: cover;
      background-position: center;
      color: white;
      padding: var(--space-6) 0;
      text-align: center;
    }
    
    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .hero h1 {
      font-size: 3rem;
      margin-bottom: var(--space-2);
      color: white;
      animation: fadeIn 1s ease-out;
    }
    
    .hero-tagline {
      font-size: 1.25rem;
      margin-bottom: var(--space-3);
      opacity: 0.9;
      animation: fadeIn 1s ease-out 0.3s forwards;
      opacity: 0;
    }
    
    .hero-cta {
      animation: fadeIn 1s ease-out 0.6s forwards;
      opacity: 0;
    }
    
    .hero .btn {
      font-size: 1.125rem;
      padding: 0.75rem 2rem;
    }
    
    .show-info {
      padding: var(--space-5) var(--space-2);
    }
    
    .show-dates {
      color: var(--primary);
      font-weight: 500;
      margin-bottom: var(--space-2);
    }
    
    .show-description {
      font-size: 1.125rem;
      max-width: 800px;
      margin-bottom: var(--space-3);
      line-height: 1.6;
    }
    
    .show-highlights {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--space-3);
      margin-top: var(--space-4);
    }
    
    .highlight {
      background-color: var(--neutral-50);
      padding: var(--space-2);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .highlight:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .highlight h3 {
      color: var(--primary);
      margin-bottom: var(--space-1);
    }
    
    .pricing-info {
      padding: var(--space-5) var(--space-2);
      background-color: var(--neutral-100);
    }
    
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--space-3);
      margin: var(--space-4) 0;
    }
    
    .pricing-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      padding: var(--space-3);
      text-align: center;
      transition: transform 0.3s ease;
    }
    
    .pricing-card:hover {
      transform: translateY(-10px);
    }
    
    .section-name {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: var(--space-1);
    }
    
    .section-price {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--neutral-900);
      margin-bottom: var(--space-2);
    }
    
    .section-details {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .section-details li {
      padding: var(--space-1) 0;
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .section-details li:last-child {
      border-bottom: none;
    }
    
    .booking-cta {
      margin-top: var(--space-4);
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem;
      }
      
      .hero-tagline {
        font-size: 1rem;
      }
      
      .show-highlights {
        grid-template-columns: 1fr;
      }
      
      .pricing-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {}