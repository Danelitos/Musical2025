import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <div class="container header-container">
        <div class="logo">
          <a routerLink="/">
            <span class="logo-text">En Belén de Judá</span>
            <span class="logo-subtitle">Entradas</span>
          </a>
        </div>
        <nav>
          <ul>
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Inicio</a></li>
            <li><a routerLink="/seating" routerLinkActive="active">Reservar Entradas</a></li>
          </ul>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    header {
      background-color: var(--primary);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-2) var(--space-2);
    }
    
    .logo a {
      display: flex;
      flex-direction: column;
      color: white;
      text-decoration: none;
    }
    
    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    
    .logo-subtitle {
      font-size: 0.875rem;
      letter-spacing: 1px;
      color: var(--accent);
    }
    
    nav ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    nav li {
      margin-left: var(--space-3);
    }
    
    nav a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      padding-bottom: 4px;
      border-bottom: 2px solid transparent;
    }
    
    nav a:hover {
      text-decoration: none;
      border-bottom: 2px solid var(--accent);
    }
    
    nav a.active {
      border-bottom: 2px solid var(--accent);
    }
    
    @media (max-width: 768px) {
      .header-container {
        flex-direction: column;
        align-items: center;
      }
      
      nav {
        margin-top: var(--space-1);
      }
      
      nav li {
        margin-left: var(--space-2);
        margin-right: var(--space-2);
      }
    }
  `]
})
export class HeaderComponent {}