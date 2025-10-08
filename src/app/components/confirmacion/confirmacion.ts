import { Component, OnInit, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StripeService } from '../../services/stripe.service';

interface ReservaDetalles {
  sessionId: string;
  customerName: string;
  customerEmail: string;
  sesionFecha: string;
  sesionHora: string;
  sesionLugar: string;
  numEntradas: number;
  precioTotal: number;
  estado: 'loading' | 'success' | 'error';
}

@Component({
  selector: 'app-confirmacion',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.scss'
})
export class Confirmacion implements OnInit {
  reserva = signal<ReservaDetalles>({
    sessionId: '',
    customerName: '',
    customerEmail: '',
    sesionFecha: '',
    sesionHora: '',
    sesionLugar: '',
    numEntradas: 0,
    precioTotal: 0,
    estado: 'loading'
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(StripeService) private stripeService: StripeService
  ) {}

  async ngOnInit() {
    const sessionId = this.route.snapshot.queryParams['session_id'];
    
    if (!sessionId) {
      this.reserva.update(r => ({ ...r, estado: 'error' }));
      return;
    }

    try {
      // Obtener detalles del pago desde el backend
      const paymentDetails = await this.stripeService.getCheckoutSession(sessionId);
      
      if (paymentDetails.status === 'success' && paymentDetails.paymentStatus === 'paid') {
        this.reserva.set({
          sessionId: sessionId,
          customerName: paymentDetails.metadata?.customerName || 'Cliente',
          customerEmail: paymentDetails.customerEmail || 'cliente@example.com',
          sesionFecha: paymentDetails.metadata?.sesionFecha || '12/12/2024',
          sesionHora: paymentDetails.metadata?.sesionHora || '20:00',
          sesionLugar: paymentDetails.metadata?.sesionLugar || 'Teatro de Deusto (Bilbao)',
          numEntradas: parseInt(paymentDetails.metadata?.numEntradas) || 1,
          precioTotal: paymentDetails.amountTotal || 7,
          estado: 'success'
        });
        
        // Enviar email de confirmación
        await this.enviarEmailConfirmacion();
      } else {
        this.reserva.update(r => ({ ...r, estado: 'error' }));
      }

      // Simular el envío de email de confirmación
      await this.enviarEmailConfirmacion();

    } catch (error) {
      console.error('Error al procesar la confirmación:', error);
      this.reserva.update(r => ({ ...r, estado: 'error' }));
    }
  }

  private async enviarEmailConfirmacion(): Promise<void> {
    try {
      // En producción, esto sería una llamada real a tu backend
      // que enviaría el email usando nodemailer o un servicio similar
      
      const emailData = {
        to: this.reserva().customerEmail,
        subject: 'Confirmación de Reserva - En Belén de Judá Musical',
        customerName: this.reserva().customerName,
        sesionFecha: this.reserva().sesionFecha,
        sesionHora: this.reserva().sesionHora,
        sesionLugar: this.reserva().sesionLugar,
        numEntradas: this.reserva().numEntradas,
        precioTotal: this.reserva().precioTotal,
        sessionId: this.reserva().sessionId
      };

      // Simular llamada al backend
      console.log('Email de confirmación enviado:', emailData);
      
      // En producción sería algo como:
      /*
      await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });
      */
      
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error);
      // No fallar la confirmación solo porque el email falle
    }
  }

  volverAlInicio() {
    this.router.navigate(['/']);
  }

  descargarEntradas() {
    // En producción, esto generaría y descargaría un PDF con las entradas
    alert('Función de descarga de entradas disponible próximamente. Recibirás las entradas por email.');
  }

  compartirReserva() {
    const texto = `¡Voy a ver "En Belén de Judá" el ${this.reserva().sesionFecha} a las ${this.reserva().sesionHora}! 🎭✨ Un musical navideño que promete ser mágico.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mi reserva para "En Belén de Judá"',
        text: texto,
        url: window.location.origin
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(texto + ' ' + window.location.origin);
      alert('Texto copiado al portapapeles');
    }
  }
}
