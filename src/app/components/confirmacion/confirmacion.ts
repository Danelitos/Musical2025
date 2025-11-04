import { Component, OnInit, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StripeService } from '../../services/stripe.service';
import { LoggerService } from '../../services/logger.service';
import { environment } from '../../../environments/environment';

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
  ticketId?: string; // Ticket ID de MongoDB
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
    ticketId: undefined,
    estado: 'loading'
  });

  /** Estado de descarga del PDF */
  descargandoPDF = signal<boolean>(false);

  /** Cache del PDF generado */
  private pdfCacheado: { blob: Blob; filename: string } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(StripeService) private stripeService: StripeService,
    private logger: LoggerService
  ) {}

  /**
   * Inicializa el componente y recupera los detalles del pago
   * Obtiene el session_id de la URL y consulta el estado del pago
   * 
   * NOTA: Esta función solo CONSULTA información, no procesa el pago.
   * El procesamiento y envío de email se hace en el webhook del backend,
   * que se ejecuta UNA SOLA VEZ cuando Stripe confirma el pago.
   * Por lo tanto, recargar esta página es seguro y no causa duplicados.
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
          ticketId: paymentDetails.ticketId, // Incluir ticketId de MongoDB
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
   * Genera el PDF en el backend y lo descarga automáticamente
   * Usa caché para descargas instantáneas en solicitudes posteriores
   */
  async descargarEntradas() {
    // Evitar múltiples descargas simultáneas
    if (this.descargandoPDF()) {
      return;
    }

    try {
      const reservaActual = this.reserva();
      const ticketId = reservaActual.ticketId || 
                       reservaActual.sessionId.substring(0, 12).toUpperCase();
      const filename = `Entrada_BelenDeJuda_${ticketId}.pdf`;

      // Si ya tenemos el PDF cacheado, descarga instantánea
      if (this.pdfCacheado) {
        this.logger.info('Usando PDF cacheado - descarga instantánea');
        this.descargarBlob(this.pdfCacheado.blob, filename);
        return;
      }

      // Si no está cacheado, generarlo
      this.descargandoPDF.set(true);
      this.logger.info('Generando PDF por primera vez...');
      
      // Preparar datos para el PDF
      const datosReserva = {
        ticketId: ticketId,
        nombre: reservaActual.customerName,
        email: reservaActual.customerEmail,
        sesion: {
          fecha: reservaActual.sesionFecha,
          hora: reservaActual.sesionHora,
          lugar: reservaActual.sesionLugar,
          precioAdulto: 5,
          precioNino: 3
        },
        numEntradasAdultos: reservaActual.numEntradasAdultos,
        numEntradasNinos: reservaActual.numEntradasNinos,
        precioTotal: reservaActual.precioTotal.toFixed(2)
      };

      // Llamar al backend para generar el PDF
      const response = await fetch(`${environment.apiUrl}/email/generar-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ datosReserva })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      // Obtener el PDF como blob
      const blob = await response.blob();
      
      // Cachear el PDF para descargas futuras
      this.pdfCacheado = { blob, filename };
      
      // Descargar el PDF
      this.descargarBlob(blob, filename);
      
      this.logger.success('PDF generado y descargado exitosamente (ahora cacheado)');
      
    } catch (error) {
      this.logger.error('Error al descargar las entradas', error);
      alert('Hubo un error al descargar el PDF. Por favor, verifica tu email o contacta con soporte.');
    } finally {
      this.descargandoPDF.set(false);
    }
  }

  /**
   * Descarga un blob como archivo
   */
  private descargarBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Comparte la reserva en redes sociales
   * Usa Web Share API si está disponible, sino copia al portapapeles
   */
  compartirReserva() {
    const texto = `¡Voy a ver "En Belén De Judá" el ${this.reserva().sesionFecha} a las ${this.reserva().sesionHora}! 🎭✨ Un musical navideño que promete ser mágico.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mi reserva para "En Belén De Judá"',
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
