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
    const maxRetries = 3;
    const timeoutMs = 15000; // 15 segundos de timeout

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!this.stripe) {
          await this.initializeStripe();
        }

        if (!this.stripe) {
          throw new Error('Stripe no se pudo inicializar');
        }

        this.logger.info(`Creando sesión de checkout (intento ${attempt}/${maxRetries})`, { 
          email: data.customerEmail, 
          adultos: data.numEntradasAdultos,
          ninos: data.numEntradasNinos
        });

        // Crear promesa con timeout
        const response = await Promise.race([
          firstValueFrom(
            this.http.post<{sessionId: string, url: string}>(
              `${this.apiUrl}/stripe/create-checkout-session`, 
              data
            )
          ),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: La solicitud tardó demasiado')), timeoutMs)
          )
        ]);

        this.logger.success('Sesión de checkout creada', { sessionId: response.sessionId });

        return {
          sessionId: response.sessionId,
          url: response.url
        };

      } catch (error: any) {
        this.logger.error(`Error creando sesión de checkout (intento ${attempt}/${maxRetries})`, error);
        
        // Si es el último intento, devolver el error
        if (attempt === maxRetries) {
          let errorMessage = 'Error procesando el pago. Por favor, inténtalo de nuevo.';
          
          // Mensajes específicos según el tipo de error
          if (error.status === 0 || error.message?.includes('Timeout')) {
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
          } else if (error.status === 400) {
            errorMessage = error.error?.error || 'Datos de entrada inválidos. Por favor, verifica la información.';
          } else if (error.status === 404) {
            errorMessage = 'Sesión no disponible. Por favor, selecciona otra fecha.';
          } else if (error.status === 500) {
            errorMessage = 'Error en el servidor. Por favor, contacta con soporte.';
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          }

          return { error: errorMessage };
        }
        
        // Esperar antes de reintentar (backoff exponencial: 1s, 2s, 4s)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }

    return { error: 'Error inesperado procesando el pago' };
  }

  /**
   * Obtiene el estado de una sesión de checkout
   * 
   * @param sessionId - ID de la sesión de Stripe
   * @returns Estado del pago y detalles asociados
   */
  async getCheckoutSession(sessionId: string): Promise<PaymentStatus> {
    const maxRetries = 3;
    const timeoutMs = 30000; // 30 segundos (más tiempo porque puede estar procesando el webhook)

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.info(`Recuperando estado de la sesión (intento ${attempt}/${maxRetries})`, { sessionId });
        
        const response = await Promise.race([
          firstValueFrom(
            this.http.get<PaymentStatus>(`${this.apiUrl}/stripe/checkout-session/${sessionId}`)
          ),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout recuperando estado del pago')), timeoutMs)
          )
        ]);
        
        this.logger.success('Estado de sesión recuperado', { 
          status: response.paymentStatus 
        });
        
        return response;
      } catch (error: any) {
        this.logger.error(`Error obteniendo sesión de checkout (intento ${attempt}/${maxRetries})`, error);
        
        if (attempt === maxRetries) {
          return {
            status: 'error',
            paymentStatus: 'failed'
          };
        }
        
        // Esperar antes de reintentar
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }

    return { status: 'error', paymentStatus: 'failed' };
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
