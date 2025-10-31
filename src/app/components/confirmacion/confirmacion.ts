import { Component, OnInit, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StripeService } from '../../services/stripe.service';
import { LoggerService } from '../../services/logger.service';

/**
 * Interfaz para los detalles de la reserva confirmada
 */
interface ReservaDetalles {
  sessionId: string;
  customerName: string;
  customerEmail: string;
  sesionFecha: string;
  sesionHora: string;
  sesionLugar: string;
  numEntradasAdultos: number;
  numEntradasNinos: number;
  numEntradas: number;
  precioTotal: number;
  estado: 'loading' | 'success' | 'error';
}

/**
 * Componente de Confirmación de Pago
 * 
 * Muestra los detalles de una reserva completada exitosamente
 * después de procesar el pago con Stripe.
 * 
 * Funcionalidades:
 * - Recupera detalles del pago desde Stripe
 * - Envía email de confirmación al cliente
 * - Permite compartir la reserva en redes sociales
 * - Opción de descarga de entradas (futuro)
 * 
 * @example
 * URL: /confirmacion?session_id=cs_test_...
 */
@Component({
  selector: 'app-confirmacion',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.scss'
})
export class Confirmacion implements OnInit {
  /** Detalles de la reserva confirmada */
  reserva = signal<ReservaDetalles>({
    sessionId: '',
    customerName: '',
    customerEmail: '',
    sesionFecha: '',
    sesionHora: '',
    sesionLugar: '',
    numEntradasAdultos: 0,
    numEntradasNinos: 0,
    numEntradas: 0,
    precioTotal: 0,
    estado: 'loading'
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(StripeService) private stripeService: StripeService,
    private logger: LoggerService
  ) {}

  /**
   * Inicializa el componente y recupera los detalles del pago
   * Obtiene el session_id de la URL y consulta el estado del pago
   */
  async ngOnInit() {
    const sessionId = this.route.snapshot.queryParams['session_id'];
    
    if (!sessionId) {
      this.logger.warn('No se proporcionó session_id en la URL');
      this.reserva.update(r => ({ ...r, estado: 'error' }));
      return;
    }

    try {
      this.logger.info('Recuperando detalles de la sesión de pago', { sessionId });
      
      // Obtener detalles del pago desde el backend
      const paymentDetails = await this.stripeService.getCheckoutSession(sessionId);
      
      if (paymentDetails.status === 'success' && paymentDetails.paymentStatus === 'paid') {
        const numEntradasAdultos = parseInt(paymentDetails.metadata?.numEntradasAdultos) || 0;
        const numEntradasNinos = parseInt(paymentDetails.metadata?.numEntradasNinos) || 0;
        const totalEntradas = parseInt(paymentDetails.metadata?.totalEntradas) || (numEntradasAdultos + numEntradasNinos);
        
        this.reserva.set({
          sessionId: sessionId,
          customerName: paymentDetails.metadata?.customerName || 'Cliente',
          customerEmail: paymentDetails.customerEmail || 'cliente@example.com',
          sesionFecha: paymentDetails.metadata?.sesionFecha || '12/12/2025',
          sesionHora: paymentDetails.metadata?.sesionHora || '20:00',
          sesionLugar: paymentDetails.metadata?.sesionLugar || 'Teatro Salesianos de Deusto (Bilbao)',
          numEntradasAdultos: numEntradasAdultos,
          numEntradasNinos: numEntradasNinos,
          numEntradas: totalEntradas,
          precioTotal: paymentDetails.amountTotal || 7,
          estado: 'success'
        });
        
        this.logger.success('Pago confirmado exitosamente', this.reserva());
        
        // Lanzar confeti de celebración
        this.lanzarConfeti();
        
        // El email de confirmación se envía automáticamente desde el webhook
        // No es necesario enviarlo desde aquí
      } else if (paymentDetails.status === 'pending') {
        this.logger.warn('Pago pendiente de completarse', paymentDetails);
        this.reserva.update(r => ({ ...r, estado: 'loading' }));
        
        // Reintentar después de 3 segundos
        setTimeout(() => this.ngOnInit(), 3000);
      } else {
        this.logger.warn('Pago no completado o estado inválido', paymentDetails);
        this.reserva.update(r => ({ ...r, estado: 'error' }));
      }

    } catch (error) {
      this.logger.error('Error al procesar la confirmación', error);
      this.reserva.update(r => ({ ...r, estado: 'error' }));
    }
  }

  /**
   * Navega de vuelta a la página principal
   * Recarga la página completa para volver al principio
   */
  volverAlInicio() {
    window.location.href = '/';
  }

  /**
   * Descarga las entradas en formato PDF
   * TODO: Implementar generación de PDF con entradas
   */
  descargarEntradas() {
    this.logger.info('Solicitud de descarga de entradas');
    // En producción, esto generaría y descargaría un PDF con las entradas
    alert('Función de descarga de entradas disponible próximamente. Recibirás las entradas por email.');
  }

  /**
   * Comparte la reserva en redes sociales
   * Usa Web Share API si está disponible, sino copia al portapapeles
   */
  compartirReserva() {
    const texto = `¡Voy a ver "En Belén de Judá" el ${this.reserva().sesionFecha} a las ${this.reserva().sesionHora}! 🎭✨ Un musical navideño que promete ser mágico.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mi reserva para "En Belén de Judá"',
        text: texto,
        url: window.location.origin
      }).then(() => {
        this.logger.success('Reserva compartida exitosamente');
      }).catch((error) => {
        this.logger.warn('Compartir cancelado', error);
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(texto + ' ' + window.location.origin);
      alert('Texto copiado al portapapeles');
      this.logger.info('Texto copiado al portapapeles (fallback)');
    }
  }

  /**
   * Lanza animación de confeti al confirmar pago exitoso
   * Crea partículas de confeti con colores navideños
   */
  private lanzarConfeti(): void {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);

    const colors = ['#D4AF37', '#FFD700', '#8B0000', '#228B22', '#F5F5DC', '#C41E3A'];
    const confettiCount = 80;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const animationDelay = Math.random() * 0.5;
        const animationDuration = 2 + Math.random() * 2;
        const size = 8 + Math.random() * 6;
        
        confetti.style.left = `${left}%`;
        confetti.style.backgroundColor = color;
        confetti.style.animationDelay = `${animationDelay}s`;
        confetti.style.animationDuration = `${animationDuration}s`;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        
        confettiContainer.appendChild(confetti);
        
        // Eliminar el confeti después de la animación
        setTimeout(() => {
          confetti.remove();
        }, (animationDuration + animationDelay) * 1000);
      }, i * 30);
    }

    // Eliminar el contenedor después de que todo el confeti haya caído
    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
  }
}
