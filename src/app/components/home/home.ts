import { Component, OnInit, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { StripeService } from '../../services/stripe.service';

interface Sesion {
  id: string;
  fecha: Date;
  hora: string;
  lugar: string;
  precio: number;
  entradasDisponibles: number;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  carouselImages = signal([
    { src: 'assets/images/carousel1.jpg', alt: 'Escena del musical En Belén de Judá' },
    { src: 'assets/images/carousel2.jpg', alt: 'Actores del musical' },
    { src: 'assets/images/carousel3.jpg', alt: 'Público disfrutando del espectáculo' },
    { src: 'assets/images/carousel4.jpg', alt: 'Puesta en escena navideña' }
  ]);

  currentImageIndex = signal(0);
  
  sesiones = signal<Sesion[]>([
    {
      id: '1',
      fecha: new Date('2024-12-12'),
      hora: '20:00',
      lugar: 'Teatro de Deusto (Bilbao)',
      precio: 7,
      entradasDisponibles: 550
    },
    {
      id: '2',
      fecha: new Date('2024-12-21'),
      hora: '20:00',
      lugar: 'Teatro de Deusto (Bilbao)',
      precio: 7,
      entradasDisponibles: 550
    }
  ]);

  compraForm: FormGroup;
  isSubmitting = signal(false);

  constructor(
    private fb: FormBuilder,
    @Inject(StripeService) private stripeService: StripeService,
    private router: Router
  ) {
    this.compraForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      sesionId: ['', Validators.required],
      numEntradas: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  ngOnInit() {
    this.startCarousel();
  }

  startCarousel() {
    setInterval(() => {
      this.currentImageIndex.update(index => 
        (index + 1) % this.carouselImages().length
      );
    }, 5000); // Cambio cada 5 segundos
  }

  scrollToReservas() {
    const element = document.getElementById('reservas-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToCompra() {
    const element = document.getElementById('compra-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  getSesionById(id: string): Sesion | undefined {
    return this.sesiones().find(sesion => sesion.id === id);
  }

  get precioTotal(): number {
    const sesionId = this.compraForm.get('sesionId')?.value;
    const numEntradas = this.compraForm.get('numEntradas')?.value || 0;
    const sesion = this.getSesionById(sesionId);
    return sesion ? sesion.precio * numEntradas : 0;
  }

  async onSubmitCompra() {
    if (this.compraForm.valid) {
      this.isSubmitting.set(true);
      
      try {
        const formData = this.compraForm.value;
        const sesion = this.getSesionById(formData.sesionId);
        
        if (!sesion) {
          throw new Error('Sesión no encontrada');
        }

        // Crear la sesión de pago con Stripe
        const checkoutData = {
          customerEmail: formData.email,
          customerName: formData.nombre,
          sesionId: formData.sesionId,
          numEntradas: formData.numEntradas,
          precioUnitario: sesion.precio,
          precioTotal: this.precioTotal,
          sesionInfo: {
            fecha: sesion.fecha.toLocaleDateString('es-ES'),
            hora: sesion.hora,
            lugar: sesion.lugar
          }
        };

        const result = await this.stripeService.createCheckoutSession(checkoutData);
        
        if (result.url) {
          // Redirigir a Stripe Checkout
          window.location.href = result.url;
        }
        
      } catch (error) {
        console.error('Error al procesar el pago:', error);
        alert('Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.');
      } finally {
        this.isSubmitting.set(false);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.compraForm.controls).forEach(key => {
      this.compraForm.get(key)?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.compraForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (field?.hasError('email')) {
      return 'Introduce un email válido';
    }
    
    if (field?.hasError('minlength')) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (field?.hasError('min')) {
      return 'Debe seleccionar al menos 1 entrada';
    }
    
    if (field?.hasError('max')) {
      return 'Máximo 10 entradas por compra';
    }
    
    return '';
  }
}
