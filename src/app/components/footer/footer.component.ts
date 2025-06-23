import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      <div class="container">
        <div class="footer-content">
          <div class="copyright">
            © 2025 En Belén de Judá. Todos los derechos reservados.
          </div>
          <div class="footer-links">
            <a href="#">Política de Privacidad</a>
            <a href="#">Términos de Servicio</a>
            <a href="#">Contáctanos</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    footer {
      background-color: var(--primary);
      color: white;
      padding: var(--space-3) 0;
      margin-top: var(--space-4);
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .footer-links {
      display: flex;
      gap: var(--space-2);
    }
    
    .footer-links a {
      color: var(--neutral-300);
      font-size: 0.875rem;
    }
    
    .footer-links a:hover {
      color: white;
    }
    
    .copyright {
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        text-align: center;
      }
      
      .footer-links {
        margin-top: var(--space-1);
      }
    }
  `]
})
export class FooterComponent {}