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
import { HttpClient } from '@angular/common/http';
import { StripeService } from '../../services/stripe.service';
import { LoggerService } from '../../services/logger.service';
import { environment } from '../../../environments/environment';

/**
 * Interfaz para las sesiones del musical
 */
interface Sesion {
  id: string;
  fecha: Date;
  hora: string;
  lugar: string;
  precioAdulto: number;
  precioNino: number;
  entradasDisponibles: number;
}

/**
 * Componente principal Home
 * 
 * Gestiona la página principal del musical incluyendo:
 * - Carrusel de imágenes automático
 * - Listado de sesiones disponibles
 * - Formulario de compra de entradas
 * - Integración con Stripe para pagos
 * 
 * @example
 * <app-home></app-home>
 */
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
  /** Imágenes del carrusel principal */
  carouselImages = signal([
    { src: 'assets/images/carousel1.jpg', alt: 'Escena del musical En Belén de Judá' },
    { src: 'assets/images/carousel2.jpg', alt: 'Actores del musical' },
    { src: 'assets/images/carousel3.jpg', alt: 'Público disfrutando del espectáculo' },
    { src: 'assets/images/carousel4.jpg', alt: 'Puesta en escena navideña' }
  ]);

  /** Índice actual de la imagen mostrada en el carrusel */
  currentImageIndex = signal(0);
  
  /** Sesiones disponibles del musical */
  sesiones = signal<Sesion[]>([]);

  /** Formulario reactivo de compra */
  compraForm: FormGroup;
  
  /** Estado de envío del formulario */
  isSubmitting = signal(false);

  constructor(
    private fb: FormBuilder,
    @Inject(StripeService) private stripeService: StripeService,
    private router: Router,
    private logger: LoggerService,
    private http: HttpClient
  ) {
    this.compraForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      sesionId: ['', Validators.required],
      numEntradasAdultos: [0, [Validators.min(0), Validators.max(10)]],
      numEntradasNinos: [0, [Validators.min(0), Validators.max(10)]]
    }, { validators: this.atLeastOneTicketValidator() });
  }

  ngOnInit() {
    this.startCarousel();
    this.loadSesiones();
    
    // Revalidar cuando cambie la sesión seleccionada
    this.compraForm.get('sesionId')?.valueChanges.subscribe(() => {
      this.compraForm.updateValueAndValidity();
    });
    
    // Revalidar cuando cambien las entradas
    this.compraForm.get('numEntradasAdultos')?.valueChanges.subscribe(() => {
      this.compraForm.updateValueAndValidity();
    });
    
    this.compraForm.get('numEntradasNinos')?.valueChanges.subscribe(() => {
      this.compraForm.updateValueAndValidity();
    });
  }
  
  /**
   * Carga las sesiones disponibles desde el backend
   */
  async loadSesiones() {
    try {
      const apiUrl = environment.production 
        ? '/api/stripe/sesiones' 
        : 'http://localhost:3000/api/stripe/sesiones';
        
      const sesionesData = await this.http.get<any[]>(apiUrl).toPromise();
      
      if (sesionesData) {
        // Convertir fechas de string a Date
        const sesionesConFecha = sesionesData.map(s => ({
          ...s,
          fecha: new Date(s.fecha)
        }));
        
        this.sesiones.set(sesionesConFecha);
        this.logger.info('Sesiones cargadas correctamente', sesionesConFecha);
      }
    } catch (error) {
      this.logger.error('Error cargando sesiones', error);
      // Usar datos de fallback si falla la carga
      this.sesiones.set([
        {
          id: '1',
          fecha: new Date('2025-12-12'),
          hora: '20:00',
          lugar: 'Teatro Salesianos de Deusto (Bilbao)',
          precioAdulto: 5,
          precioNino: 3,
          entradasDisponibles: 550
        },
        {
          id: '2',
          fecha: new Date('2025-12-21'),
          hora: '20:00',
          lugar: 'Teatro Salesianosde Deusto (Bilbao)',
          precioAdulto: 5,
          precioNino: 3,
          entradasDisponibles: 550
        }
      ]);
    }
  }

  /**
   * Validador personalizado: al menos una entrada (adulto o niño) debe ser > 0
   * y no puede exceder las entradas disponibles
   * @returns Función validadora para el FormGroup
   */
  private atLeastOneTicketValidator() {
    return (group: FormGroup): {[key: string]: any} | null => {
      const adultos = group.get('numEntradasAdultos')?.value || 0;
      const ninos = group.get('numEntradasNinos')?.value || 0;
      const totalEntradas = adultos + ninos;
      
      if (totalEntradas === 0) {
        return { atLeastOneTicket: true };
      }
      
      // Validar que no exceda las entradas disponibles
      const sesionId = group.get('sesionId')?.value;
      if (sesionId) {
        const sesion = this.sesiones().find(s => s.id === sesionId);
        if (sesion && totalEntradas > sesion.entradasDisponibles) {
          return { 
            exceedsAvailable: { 
              message: `Solo quedan ${sesion.entradasDisponibles} entradas disponibles para esta función` 
            } 
          };
        }
      }
      
      return null;
    };
  }

  /**
   * Inicia el carrusel automático de imágenes
   * Cambia de imagen cada 5 segundos
   */
  startCarousel() {
    setInterval(() => {
      this.currentImageIndex.update(index => 
        (index + 1) % this.carouselImages().length
      );
    }, 5000);
  }

  /**
   * Obtiene las opciones de entradas disponibles según las entradas restantes
   * @param tipo - Tipo de entrada ('adultos' o 'ninos')
   * @returns Array de números disponibles para seleccionar
   */
  getAvailableTickets(tipo: 'adultos' | 'ninos'): number[] {
    const sesionId = this.compraForm.get('sesionId')?.value;
    if (!sesionId) {
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
    
    const sesion = this.getSesionById(sesionId);
    if (!sesion) {
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
    
    const entradasDisponibles = sesion.entradasDisponibles;
    const maxEntradas = Math.min(10, entradasDisponibles);
    
    const options: number[] = [];
    for (let i = 0; i <= maxEntradas; i++) {
      options.push(i);
    }
    
    return options;
  }
  
  /**
   * Obtiene el número de entradas restantes para la sesión seleccionada
   * @returns Número de entradas restantes o null si no hay sesión seleccionada
   */
  getEntradasRestantes(): number | null {
    const sesionId = this.compraForm.get('sesionId')?.value;
    if (!sesionId) return null;
    
    const sesion = this.getSesionById(sesionId);
    return sesion ? sesion.entradasDisponibles : null;
  }

  /**
   * Scroll suave a la sección de reservas
   */
  scrollToReservas() {
    const element = document.getElementById('reservas-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Scroll suave a la sección de compra
   */
  scrollToCompra() {
    const element = document.getElementById('compra-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Obtiene una sesión por su ID
   * @param id - ID de la sesión a buscar
   * @returns Sesión encontrada o undefined
   */
  getSesionById(id: string): Sesion | undefined {
    return this.sesiones().find(sesion => sesion.id === id);
  }

  /**
   * Calcula el precio total de la compra
   * @returns Precio total (adultos × precioAdulto + niños × precioNino)
   */
  get precioTotal(): number {
    const sesionId = this.compraForm.get('sesionId')?.value;
    const numAdultos = this.compraForm.get('numEntradasAdultos')?.value || 0;
    const numNinos = this.compraForm.get('numEntradasNinos')?.value || 0;
    const sesion = this.getSesionById(sesionId);
    
    if (!sesion) return 0;
    
    return (sesion.precioAdulto * numAdultos) + (sesion.precioNino * numNinos);
  }

  /**
   * Obtiene el número total de entradas
   */
  get totalEntradas(): number {
    const numAdultos = this.compraForm.get('numEntradasAdultos')?.value || 0;
    const numNinos = this.compraForm.get('numEntradasNinos')?.value || 0;
    return numAdultos + numNinos;
  }

  /**
   * Procesa el envío del formulario de compra
   * Crea una sesión de checkout en Stripe y redirige al usuario
   */
  async onSubmitCompra() {
    if (this.compraForm.valid) {
      this.isSubmitting.set(true);
      
      try {
        const formData = this.compraForm.value;
        const sesion = this.getSesionById(formData.sesionId);
        
        if (!sesion) {
          throw new Error('Sesión no encontrada');
        }

        // Preparar datos para Stripe Checkout
        const checkoutData = {
          customerEmail: formData.email,
          customerName: formData.nombre,
          sesionId: formData.sesionId,
          numEntradasAdultos: formData.numEntradasAdultos || 0,
          numEntradasNinos: formData.numEntradasNinos || 0,
          precioAdulto: sesion.precioAdulto,
          precioNino: sesion.precioNino,
          precioTotal: this.precioTotal,
          sesionInfo: {
            fecha: sesion.fecha.toLocaleDateString('es-ES'),
            hora: sesion.hora,
            lugar: sesion.lugar
          }
        };

        this.logger.info('Iniciando proceso de checkout', checkoutData);

        const result = await this.stripeService.createCheckoutSession(checkoutData);
        
        if (result.url) {
          this.logger.success('Sesión de checkout creada, redirigiendo a Stripe');
          // Redirigir a Stripe Checkout
          window.location.href = result.url;
        }
        
      } catch (error) {
        this.logger.error('Error al procesar el pago', error);
        alert('Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.');
      } finally {
        this.isSubmitting.set(false);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Marca todos los campos del formulario como tocados
   * Útil para mostrar mensajes de validación
   */
  private markFormGroupTouched() {
    Object.keys(this.compraForm.controls).forEach(key => {
      this.compraForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Obtiene el mensaje de error para un campo del formulario
   * @param fieldName - Nombre del campo
   * @returns Mensaje de error localizado
   */
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
