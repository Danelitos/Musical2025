import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Html5Qrcode } from 'html5-qrcode';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface ValidacionResponse {
  success: boolean;
  message?: string;
  code: string;
  ticketId: string;
  error?: string;
  detalles?: {
    nombreCliente: string;
    emailCliente: string;
    totalEntradas: number;
    entradasAdultos: number;
    entradasNinos: number;
    sesion: {
      fecha: string;
      hora: string;
      lugar: string;
    };
    fechaCompra: string;
    fechaValidacion?: string;
    importeTotal: number;
  };
}

interface Estadisticas {
  totalEntradas: number;
  entradasValidadas: number;
  entradasPendientes: number;
  porcentajeValidado: string;
}

@Component({
  selector: 'app-validar-entradas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validar-entradas.html',
  styleUrls: ['./validar-entradas.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'scale(0.7)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.7)', opacity: 0 }))
      ])
    ])
  ]
})
export class ValidarEntradasComponent implements OnInit, OnDestroy, AfterViewChecked {
  ticketId: string = '';
  validando: boolean = false;
  resultado: ValidacionResponse | null = null;
  estadisticas: Estadisticas | null = null;
  
  // Para la notificación flotante
  mostrarNotificacion: boolean = false;
  timerNotificacion: any = null;
  contadorEscaneos: number = 0;
  
  // Para el escáner de QR
  escaneandoQR: boolean = false;
  html5QrCode: Html5Qrcode | null = null;
  camaraIniciada: boolean = false;
  intentandoIniciarCamara: boolean = false;
  escanerPausado: boolean = false; // Pausar escaneo hasta que se acepte el resultado
  
  // Historial de validaciones
  historial: ValidacionResponse[] = [];

  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarHistorialLocal();
    
    // Actualizar estadísticas cada 30 segundos
    setInterval(() => {
      this.cargarEstadisticas();
    }, 30000);
  }

  ngAfterViewChecked(): void {
    // Iniciar la cámara cuando el elemento esté en el DOM
    if (this.escaneandoQR && !this.camaraIniciada && !this.intentandoIniciarCamara) {
      const elemento = document.getElementById('qr-reader');
      if (elemento) {
        this.iniciarCamara();
      }
    }
  }

  ngOnDestroy(): void {
    // Detener la cámara si está activa
    this.detenerEscaner();
  }

  /**
   * Valida una entrada por su ticketId
   */
  async validarEntrada(): Promise<void> {
    if (!this.ticketId.trim()) {
      this.mostrarError('Por favor ingresa un código de entrada');
      return;
    }

    console.log('🔍 Iniciando validación de:', this.ticketId);
    console.log('Modo escaneo QR:', this.escaneandoQR);

    this.validando = true;
    this.resultado = null;

    try {
      const response = await this.http.post<ValidacionResponse>(
        `${this.apiUrl}/validacion/validar-entrada`,
        { ticketId: this.ticketId.trim() }
      ).toPromise();

      console.log('📬 Respuesta recibida:', response);

      this.resultado = response!;
      
      if (response!.success) {
        console.log('✅ Validación exitosa');
        // Agregar al historial
        this.agregarAlHistorial(response!);
        
        // Reproducir sonido de éxito (opcional)
        this.reproducirSonidoExito();
        
        // Recargar estadísticas
        this.cargarEstadisticas();
        
        // Incrementar contador si estamos escaneando
        if (this.escaneandoQR) {
          this.contadorEscaneos++;
          console.log('📊 Contador actualizado:', this.contadorEscaneos);
        }
      } else {
        console.log('⚠️ Validación con advertencia');
        this.reproducirSonidoError();
      }

      // Mostrar notificación flotante si estamos en modo escaneo QR
      if (this.escaneandoQR) {
        console.log('📱 Llamando a mostrarNotificacionFlotante()...');
        this.mostrarNotificacionFlotante();
      }

      // Limpiar el input después de 2 segundos (solo si no estamos escaneando)
      if (!this.escaneandoQR) {
        setTimeout(() => {
          this.ticketId = '';
        }, 2000);
      } else {
        // En modo escaneo, limpiar inmediatamente para el siguiente escaneo
        this.ticketId = '';
        console.log('🧹 Input limpiado para siguiente escaneo');
      }

    } catch (error: any) {
      console.error('❌ Error validando entrada:', error);
      
      const errorResponse = error.error;
      if (errorResponse && errorResponse.code) {
        this.resultado = errorResponse;
      } else {
        this.mostrarError('Error de conexión. Verifica tu conexión a internet.');
      }
      
      this.reproducirSonidoError();
      
      // Mostrar notificación flotante también en errores si estamos en modo escaneo QR
      if (this.escaneandoQR) {
        console.log('📱 Llamando a mostrarNotificacionFlotante() (error)...');
        this.mostrarNotificacionFlotante();
        // Limpiar para el siguiente escaneo
        this.ticketId = '';
      }
    } finally {
      this.validando = false;
      console.log('🏁 Validación finalizada');
    }
  }

  /* MÉTODOS DESACTIVADOS - Ya no se usa entrada manual
  /**
   * Consulta información de una entrada sin validarla
   */
  /*
  async consultarEntrada(): Promise<void> {
    if (!this.ticketId.trim()) {
      this.mostrarError('Por favor ingresa un código de entrada');
      return;
    }

    this.validando = true;
    this.resultado = null;

    try {
      const response = await this.http.get<any>(
        `${this.apiUrl}/validacion/consultar-entrada/${this.ticketId.trim()}`
      ).toPromise();

      this.resultado = {
        success: true,
        code: 'CONSULTA_OK',
        ticketId: response.ticketId,
        message: response.validada 
          ? 'Esta entrada ya fue validada' 
          : 'Entrada válida, aún no validada',
        detalles: response.detalles
      };

    } catch (error: any) {
      console.error('Error consultando entrada:', error);
      this.mostrarError('No se pudo consultar la entrada');
    } finally {
      this.validando = false;
    }
  }
  */

  /**
   * Carga las estadísticas del servidor
   */
  async cargarEstadisticas(): Promise<void> {
    try {
      const response = await this.http.get<any>(
        `${this.apiUrl}/validacion/estadisticas`
      ).toPromise();

      if (response.success) {
        this.estadisticas = response.estadisticas;
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  /**
   * Activa el modo de escaneo de QR (requiere cámara)
   */
  activarEscanerQR(): void {
    this.escaneandoQR = true;
    this.resultado = null;
    this.contadorEscaneos = 0;
    this.escanerPausado = false; // Resetear el estado de pausa
    this.cerrarNotificacion();
    // La cámara se iniciará automáticamente en ngAfterViewChecked
  }

  /**
   * Inicia la cámara para escanear QR
   */
  private async iniciarCamara(): Promise<void> {
    this.intentandoIniciarCamara = true;
    
    try {
      // Inicializar el escáner
      this.html5QrCode = new Html5Qrcode('qr-reader');
      
      // Configuración del escáner
      const config = {
        fps: 10,    // Frames por segundo
        qrbox: { width: 250, height: 250 },  // Área de escaneo
        aspectRatio: 1.0
      };
      
      // Iniciar el escáner con la cámara trasera (si está disponible)
      await this.html5QrCode.start(
        { facingMode: 'environment' }, // Cámara trasera
        config,
        (decodedText, decodedResult) => {
          // Callback cuando se escanea un código
          console.log('🎫 QR escaneado:', decodedText);
          this.onQRScanned(decodedText);
        },
        (errorMessage) => {
          // Errores de escaneo (se pueden ignorar, son muy frecuentes)
          // console.log('Error de escaneo:', errorMessage);
        }
      );
      
      this.camaraIniciada = true;
      console.log('📷 Cámara iniciada correctamente');
      
    } catch (error: any) {
      console.error('❌ Error iniciando cámara:', error);
      this.escaneandoQR = false;
      alert('No se pudo acceder a la cámara. Por favor, permite el acceso a la cámara en tu navegador o usa entrada manual.');
    } finally {
      this.intentandoIniciarCamara = false;
    }
  }

  /**
   * Detiene el escáner de QR
   */
  async detenerEscaner(): Promise<void> {
    if (this.html5QrCode && this.camaraIniciada) {
      try {
        await this.html5QrCode.stop();
        this.html5QrCode.clear();
        this.camaraIniciada = false;
        console.log('📷 Cámara detenida');
      } catch (error) {
        console.error('Error deteniendo cámara:', error);
      }
    }
    this.escaneandoQR = false;
  }

  /**
   * Maneja el escaneo exitoso de un QR
   */
  async onQRScanned(result: string): Promise<void> {
    // NO escanear si está pausado esperando confirmación
    if (this.escanerPausado) {
      console.log('⏸️ Escáner pausado, esperando confirmación del usuario...');
      return;
    }
    
    // NO escanear si ya está validando
    if (this.validando) {
      console.log('⌛ Ya se está validando una entrada, ignorando escaneo...');
      return;
    }
    
    // Pausar el escáner para evitar escaneos múltiples
    this.escanerPausado = true;
    
    // Asignar el valor escaneado
    this.ticketId = result;
    
    console.log('🎫 QR Escaneado:', result);
    
    // Validar automáticamente
    await this.validarEntrada();
  }

  /* MÉTODO DESACTIVADO - Ya no se usa entrada manual
  /**
   * Limpia el resultado actual
   */
  /*
  limpiarResultado(): void {
    this.resultado = null;
    this.ticketId = '';
  }
  */

  /**
   * Agrega una validación al historial local
   */
  private agregarAlHistorial(validacion: ValidacionResponse): void {
    this.historial.unshift(validacion);
    
    // Mantener solo las últimas 20 validaciones
    if (this.historial.length > 20) {
      this.historial = this.historial.slice(0, 20);
    }
    
    // Guardar en localStorage
    localStorage.setItem('historialValidaciones', JSON.stringify(this.historial));
  }

  /**
   * Carga el historial desde localStorage
   */
  private cargarHistorialLocal(): void {
    const historialGuardado = localStorage.getItem('historialValidaciones');
    if (historialGuardado) {
      try {
        this.historial = JSON.parse(historialGuardado);
      } catch (e) {
        console.error('Error cargando historial:', e);
        this.historial = [];
      }
    }
  }

  /**
   * Muestra un mensaje de error temporal
   */
  private mostrarError(mensaje: string): void {
    this.resultado = {
      success: false,
      code: 'ERROR',
      ticketId: this.ticketId,
      error: mensaje
    };
  }

  /**
   * Reproduce un sonido de éxito (opcional)
   */
  private reproducirSonidoExito(): void {
    // Opcional: reproducir un beep de éxito
    // Se puede implementar con un archivo de audio real
  }

  /**
   * Reproduce un sonido de error (opcional)
   */
  private reproducirSonidoError(): void {
    // Opcional: reproducir un beep de error
    // Se puede implementar con un archivo de audio real
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleString('es-ES');
  }

  /**
   * Obtiene la clase CSS según el código de respuesta
   */
  getResultadoClass(): string {
    if (!this.resultado) return '';
    
    switch (this.resultado.code) {
      case 'TICKET_VALIDATED':
        return 'exito';
      case 'TICKET_ALREADY_USED':
        return 'advertencia';
      case 'TICKET_NOT_FOUND':
        return 'error';
      default:
        return 'info';
    }
  }

  /**
   * Obtiene el icono según el código de respuesta
   */
  getResultadoIcono(): string {
    if (!this.resultado) return '';
    
    switch (this.resultado.code) {
      case 'TICKET_VALIDATED':
        return '✅';
      case 'TICKET_ALREADY_USED':
        return '⚠️';
      case 'TICKET_NOT_FOUND':
        return '❌';
      default:
        return 'ℹ️';
    }
  }

  /**
   * Muestra la notificación flotante
   */
  mostrarNotificacionFlotante(): void {
    console.log('🔔 Mostrando notificación flotante');
    console.log('Estado actual:', {
      mostrarNotificacion: this.mostrarNotificacion,
      resultado: this.resultado,
      escaneandoQR: this.escaneandoQR
    });
    
    // Limpiar cualquier timer anterior
    if (this.timerNotificacion) {
      clearTimeout(this.timerNotificacion);
    }

    // Mostrar la notificación
    this.mostrarNotificacion = true;

    console.log('✅ Notificación activada. mostrarNotificacion =', this.mostrarNotificacion);

    // NO auto-ocultar - el usuario debe confirmar manualmente
    // (Se ha eliminado el timer automático)
  }

  /**
   * Cierra la notificación flotante
   */
  cerrarNotificacion(): void {
    this.mostrarNotificacion = false;
    if (this.timerNotificacion) {
      clearTimeout(this.timerNotificacion);
      this.timerNotificacion = null;
    }
    
    // Reanudar el escáner para permitir siguiente escaneo
    if (this.escaneandoQR) {
      console.log('▶️ Reanudando escáner para siguiente QR');
      this.escanerPausado = false;
    }
  }

  /**
   * Obtiene la clase CSS para la notificación
   */
  getNotificacionClass(): string {
    if (!this.resultado) return '';
    
    switch (this.resultado.code) {
      case 'TICKET_VALIDATED':
        return 'notificacion-exito';
      case 'TICKET_ALREADY_USED':
        return 'notificacion-advertencia';
      case 'TICKET_NOT_FOUND':
        return 'notificacion-error';
      default:
        return 'notificacion-info';
    }
  }

  /**
   * Obtiene el título para la notificación
   */
  getNotificacionTitulo(): string {
    if (!this.resultado) return '';
    
    switch (this.resultado.code) {
      case 'TICKET_VALIDATED':
        return '¡Entrada Validada!';
      case 'TICKET_ALREADY_USED':
        return '¡Ya Validada!';
      case 'TICKET_NOT_FOUND':
        return 'Entrada No Encontrada';
      default:
        return this.resultado.message || this.resultado.error || 'Resultado';
    }
  }
}
