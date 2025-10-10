import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from './logger.service';

/**
 * Datos necesarios para crear una sesión de checkout
 */
export interface CheckoutData {
  customerEmail: string;
  customerName: string;
  sesionId: string;
  numEntradasAdultos: number;
  numEntradasNinos: number;
  precioAdulto: number;
  precioNino: number;
  precioTotal: number;
  sesionInfo: {
    fecha: string;
    hora: string;
    lugar: string;
  };
}

/**
 * Resultado de la creación de una sesión de checkout
 */
export interface CheckoutResult {
  url?: string;
  sessionId?: string;
  error?: string;
}

/**
 * Estado del pago recuperado desde Stripe
 */
export interface PaymentStatus {
  status: string;
  customerEmail?: string;
  amountTotal?: number;
  currency?: string;
  paymentStatus?: string;
  metadata?: any;
}

/**
 * Servicio de integración con Stripe
 * 
 * Proporciona funcionalidades para:
 * - Crear sesiones de checkout
 * - Verificar estado de pagos
 * - Redirigir a Stripe Checkout
 * 
 * Utiliza la API de Stripe y se comunica con el backend
 * para operaciones seguras del lado del servidor.
 * 
 * @example
 * ```typescript
 * constructor(private stripeService: StripeService) {}
 * 
 * const result = await this.stripeService.createCheckoutSession(data);
 * if (result.url) {
 *   window.location.href = result.url;
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: Stripe | null = null;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {
    this.initializeStripe();
  }

  /**
   * Inicializa la instancia de Stripe
   * Carga la librería de Stripe con la clave pública
   */
  private async initializeStripe() {
    try {
      this.logger.info('Inicializando Stripe...');
      this.stripe = await loadStripe(environment.stripePublishableKey);
      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }
      this.logger.success('Stripe inicializado correctamente');
    } catch (error) {
      this.logger.error('Error inicializando Stripe', error);
    }
  }

  /**
   * Crea una sesión de checkout en Stripe
   * 
   * @param data - Datos del checkout (cliente, sesión, entradas, etc.)
   * @returns Resultado con URL de redirección o error
   */
  async createCheckoutSession(data: CheckoutData): Promise<CheckoutResult> {
    try {
      if (!this.stripe) {
        await this.initializeStripe();
      }

      if (!this.stripe) {
        throw new Error('Stripe no se pudo inicializar');
      }

      this.logger.info('Creando sesión de checkout', { 
        email: data.customerEmail, 
        adultos: data.numEntradasAdultos,
        ninos: data.numEntradasNinos
      });

      // Llamar al backend para crear la sesión de checkout
      const response = await firstValueFrom(
        this.http.post<{sessionId: string, url: string}>(
          `${this.apiUrl}/stripe/create-checkout-session`, 
          data
        )
      );

      this.logger.success('Sesión de checkout creada', { sessionId: response.sessionId });

      return {
        sessionId: response.sessionId,
        url: response.url
      };

    } catch (error: any) {
      this.logger.error('Error creando sesión de checkout', error);
      return {
        error: error.error?.message || error.message || 'Error procesando el pago'
      };
    }
  }

  /**
   * Obtiene el estado de una sesión de checkout
   * 
   * @param sessionId - ID de la sesión de Stripe
   * @returns Estado del pago y detalles asociados
   */
  async getCheckoutSession(sessionId: string): Promise<PaymentStatus> {
    try {
      this.logger.info('Recuperando estado de la sesión', { sessionId });
      
      const response = await firstValueFrom(
        this.http.get<PaymentStatus>(`${this.apiUrl}/stripe/checkout-session/${sessionId}`)
      );
      
      this.logger.success('Estado de sesión recuperado', { 
        status: response.paymentStatus 
      });
      
      return response;
    } catch (error: any) {
      this.logger.error('Error obteniendo sesión de checkout', error);
      return {
        status: 'error'
      };
    }
  }

  /**
   * Redirige al usuario a Stripe Checkout
   * Método alternativo si no se usa la URL directa
   * 
   * @param sessionId - ID de la sesión de checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    if (!this.stripe) {
      await this.initializeStripe();
    }

    if (!this.stripe) {
      throw new Error('Stripe no está disponible');
    }

    this.logger.info('Redirigiendo a Stripe Checkout', { sessionId });

    const result = await this.stripe.redirectToCheckout({ sessionId });
    
    if (result.error) {
      this.logger.error('Error en redirección a Stripe', result.error);
      throw new Error(result.error.message);
    }
  }
}
