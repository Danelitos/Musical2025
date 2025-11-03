/**
 * Modelo de datos para las transacciones del Musical "En Belén de Judá"
 * 
 * Define la estructura de los documentos almacenados en MongoDB
 * para cada compra exitosa de entradas.
 */

const crypto = require('crypto');

/**
 * Genera un código único de entrada para validación
 * Formato: BELEN-XXXX-XXXX-XXXX (similar a códigos de cines/eventos)
 */
function generarTicketId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `BELEN-${timestamp}-${random}`;
}

/**
 * Clase que representa una transacción de compra
 */
class Transaccion {
  /**
   * Crea una nueva transacción
   * 
   * @param {object} datos - Datos de la transacción
   * @param {string} datos.stripeSessionId - ID de la sesión de Stripe
   * @param {string} datos.stripePaymentIntentId - ID del payment intent de Stripe
   * @param {string} [datos.ticketId] - ID único de la entrada (se genera automáticamente)
   * @param {string} datos.customerEmail - Email del cliente
   * @param {string} datos.customerName - Nombre del cliente
   * @param {string} datos.sesionId - ID de la sesión del musical
   * @param {string} datos.sesionFecha - Fecha de la sesión (YYYY-MM-DD)
   * @param {string} datos.sesionHora - Hora de la sesión (HH:MM)
   * @param {string} datos.sesionLugar - Lugar de la sesión
   * @param {number} datos.numEntradasAdultos - Número de entradas de adultos
   * @param {number} datos.numEntradasNinos - Número de entradas de niños
   * @param {number} datos.totalEntradas - Total de entradas compradas
   * @param {number} datos.precioAdulto - Precio unitario adulto en EUR
   * @param {number} datos.precioNino - Precio unitario niño en EUR
   * @param {number} datos.importeTotal - Importe total pagado en EUR
   * @param {string} datos.estadoPago - Estado del pago (paid, pending, failed)
   * @param {boolean} [datos.entradaValidada] - Si la entrada ya fue validada/usada
   * @param {Date} [datos.fechaValidacion] - Fecha en que se validó la entrada
   * @param {Date} [datos.fechaCompra] - Fecha de la compra (opcional, se auto-genera)
   */
  constructor(datos) {
    // ID único de entrada para validación (QR Code)
    this.ticketId = datos.ticketId || generarTicketId();
    
    // IDs de Stripe
    this.stripeSessionId = datos.stripeSessionId;
    this.stripePaymentIntentId = datos.stripePaymentIntentId || null;
    
    // Información del cliente
    this.customerEmail = datos.customerEmail;
    this.customerName = datos.customerName;
    
    // Información de la sesión del musical
    this.sesionId = datos.sesionId;
    this.sesionFecha = datos.sesionFecha;
    this.sesionHora = datos.sesionHora;
    this.sesionLugar = datos.sesionLugar;
    
    // Entradas
    this.numEntradasAdultos = datos.numEntradasAdultos || 0;
    this.numEntradasNinos = datos.numEntradasNinos || 0;
    this.totalEntradas = datos.totalEntradas || 
      (this.numEntradasAdultos + this.numEntradasNinos);
    
    // Precios
    this.precioAdulto = datos.precioAdulto;
    this.precioNino = datos.precioNino;
    this.importeTotal = datos.importeTotal;
    
    // Estado y metadatos
    this.estadoPago = datos.estadoPago || 'paid';
    this.fechaCompra = datos.fechaCompra || new Date();
    this.metadata = datos.metadata || {};
    
    // Control de validación de entrada (para escaneo en puerta)
    this.entradaValidada = datos.entradaValidada || false;
    this.fechaValidacion = datos.fechaValidacion || null;
    
    // Para auditoría
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Convierte la transacción a un documento de MongoDB
   * 
   * @returns {object} Documento listo para insertar en MongoDB
   */
  toDocument() {
    return {
      ticketId: this.ticketId,
      stripeSessionId: this.stripeSessionId,
      stripePaymentIntentId: this.stripePaymentIntentId,
      
      customer: {
        email: this.customerEmail,
        name: this.customerName
      },
      
      sesion: {
        id: this.sesionId,
        fecha: this.sesionFecha,
        hora: this.sesionHora,
        lugar: this.sesionLugar
      },
      
      entradas: {
        adultos: this.numEntradasAdultos,
        ninos: this.numEntradasNinos,
        total: this.totalEntradas
      },
      
      precios: {
        adulto: this.precioAdulto,
        nino: this.precioNino,
        total: this.importeTotal
      },
      
      estadoPago: this.estadoPago,
      fechaCompra: this.fechaCompra,
      metadata: this.metadata,
      
      // Validación de entrada
      entradaValidada: this.entradaValidada,
      fechaValidacion: this.fechaValidacion,
      
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Crea una instancia de Transaccion desde un documento de MongoDB
   * 
   * @param {object} doc - Documento de MongoDB
   * @returns {Transaccion} Instancia de Transaccion
   */
  static fromDocument(doc) {
    return new Transaccion({
      ticketId: doc.ticketId,
      stripeSessionId: doc.stripeSessionId,
      stripePaymentIntentId: doc.stripePaymentIntentId,
      customerEmail: doc.customer.email,
      customerName: doc.customer.name,
      sesionId: doc.sesion.id,
      sesionFecha: doc.sesion.fecha,
      sesionHora: doc.sesion.hora,
      sesionLugar: doc.sesion.lugar,
      numEntradasAdultos: doc.entradas.adultos,
      numEntradasNinos: doc.entradas.ninos,
      totalEntradas: doc.entradas.total,
      precioAdulto: doc.precios.adulto,
      precioNino: doc.precios.nino,
      importeTotal: doc.precios.total,
      estadoPago: doc.estadoPago,
      fechaCompra: doc.fechaCompra,
      metadata: doc.metadata,
      entradaValidada: doc.entradaValidada,
      fechaValidacion: doc.fechaValidacion
    });
  }

  /**
   * Valida que los datos de la transacción sean correctos
   * 
   * @returns {object} { valido: boolean, errores: string[] }
   */
  validar() {
    const errores = [];

    // Validar campos obligatorios
    if (!this.stripeSessionId) errores.push('stripeSessionId es obligatorio');
    if (!this.customerEmail) errores.push('customerEmail es obligatorio');
    if (!this.customerName) errores.push('customerName es obligatorio');
    if (!this.sesionId) errores.push('sesionId es obligatorio');
    if (!this.sesionFecha) errores.push('sesionFecha es obligatorio');
    if (!this.sesionHora) errores.push('sesionHora es obligatorio');
    if (!this.sesionLugar) errores.push('sesionLugar es obligatorio');
    
    // Validar números
    if (this.totalEntradas <= 0) errores.push('totalEntradas debe ser mayor a 0');
    if (this.importeTotal <= 0) errores.push('importeTotal debe ser mayor a 0');
    if (this.numEntradasAdultos < 0) errores.push('numEntradasAdultos no puede ser negativo');
    if (this.numEntradasNinos < 0) errores.push('numEntradasNinos no puede ser negativo');
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.customerEmail && !emailRegex.test(this.customerEmail)) {
      errores.push('customerEmail no es válido');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Marca la entrada como validada (usada en la puerta del evento)
   * 
   * @returns {void}
   */
  marcarComoValidada() {
    this.entradaValidada = true;
    this.fechaValidacion = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Verifica si la entrada ya fue validada
   * 
   * @returns {boolean}
   */
  estaValidada() {
    return this.entradaValidada === true;
  }
}

module.exports = Transaccion;
