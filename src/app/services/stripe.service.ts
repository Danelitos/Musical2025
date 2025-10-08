import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface CheckoutData {
  customerEmail: string;
  customerName: string;
  sesionId: string;
  numEntradas: number;
  precioUnitario: number;
  precioTotal: number;
  sesionInfo: {
    fecha: string;
    hora: string;
    lugar: string;
  };
}

export interface CheckoutResult {
  url?: string;
  sessionId?: string;
  error?: string;
}

export interface PaymentStatus {
  status: string;
  customerEmail?: string;
  amountTotal?: number;
  currency?: string;
  paymentStatus?: string;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: Stripe | null = null;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      this.stripe = await loadStripe(environment.stripePublishableKey);
      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }
    } catch (error) {
      console.error('Error initializing Stripe:', error);
    }
  }

  async createCheckoutSession(data: CheckoutData): Promise<CheckoutResult> {
    try {
      if (!this.stripe) {
        await this.initializeStripe();
      }

      if (!this.stripe) {
        throw new Error('Stripe no se pudo inicializar');
      }

      // Llamar al backend para crear la sesión de checkout
      const response = await firstValueFrom(
        this.http.post<{sessionId: string, url: string}>(`${this.apiUrl}/stripe/create-checkout-session`, data)
      );

      return {
        sessionId: response.sessionId,
        url: response.url
      };

    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      return {
        error: error.error?.message || error.message || 'Error procesando el pago'
      };
    }
  }

  async getCheckoutSession(sessionId: string): Promise<PaymentStatus> {
    try {
      const response = await firstValueFrom(
        this.http.get<PaymentStatus>(`${this.apiUrl}/stripe/checkout-session/${sessionId}`)
      );
      
      return response;
    } catch (error: any) {
      console.error('Error getting checkout session:', error);
      return {
        status: 'error'
      };
    }
  }

  async redirectToCheckout(sessionId: string): Promise<void> {
    if (!this.stripe) {
      await this.initializeStripe();
    }

    if (!this.stripe) {
      throw new Error('Stripe no está disponible');
    }

    const result = await this.stripe.redirectToCheckout({ sessionId });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
  }
}
