import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Servicio de logging centralizado
 * 
 * Proporciona métodos para logging condicional basado en el entorno.
 * En producción, los logs informativos se desactivan automáticamente.
 * Los errores siempre se registran para debugging.
 * 
 * @example
 * ```typescript
 * constructor(private logger: LoggerService) {}
 * 
 * this.logger.info('Usuario realizó checkout');
 * this.logger.error('Error en pago', error);
 * this.logger.warn('Sesión expirada');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  
  /**
   * Registra mensajes informativos
   * Solo se muestra en modo desarrollo
   * 
   * @param message - Mensaje principal
   * @param optionalParams - Parámetros adicionales
   */
  info(message: string, ...optionalParams: any[]): void {
    if (!environment.production) {
      console.log(`ℹ️ [INFO] ${message}`, ...optionalParams);
    }
  }

  /**
   * Registra mensajes de error
   * Se muestra en todos los entornos
   * 
   * @param message - Mensaje de error
   * @param optionalParams - Parámetros adicionales (ej: objeto de error)
   */
  error(message: string, ...optionalParams: any[]): void {
    console.error(`❌ [ERROR] ${message}`, ...optionalParams);
    
    // TODO: En producción, enviar a servicio de monitoreo (Sentry, LogRocket, etc.)
    if (environment.production) {
      // this.sendToMonitoringService(message, optionalParams);
    }
  }

  /**
   * Registra advertencias
   * Solo se muestra en modo desarrollo
   * 
   * @param message - Mensaje de advertencia
   * @param optionalParams - Parámetros adicionales
   */
  warn(message: string, ...optionalParams: any[]): void {
    if (!environment.production) {
      console.warn(`⚠️ [WARN] ${message}`, ...optionalParams);
    }
  }

  /**
   * Registra mensajes de éxito
   * Solo se muestra en modo desarrollo
   * 
   * @param message - Mensaje de éxito
   * @param optionalParams - Parámetros adicionales
   */
  success(message: string, ...optionalParams: any[]): void {
    if (!environment.production) {
      console.log(`✅ [SUCCESS] ${message}`, ...optionalParams);
    }
  }

  /**
   * Registra mensajes de debug detallados
   * Solo se muestra en modo desarrollo
   * 
   * @param message - Mensaje de debug
   * @param optionalParams - Parámetros adicionales
   */
  debug(message: string, ...optionalParams: any[]): void {
    if (!environment.production) {
      console.debug(`🐛 [DEBUG] ${message}`, ...optionalParams);
    }
  }
}
