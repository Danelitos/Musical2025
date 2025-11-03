const { obtenerDB } = require('../config/database');
const Transaccion = require('../models/transaccion.model');
const { ObjectId } = require('mongodb');

// Nombre de la colección
const COLECCION_TRANSACCIONES = 'transacciones';

/**
 * Guarda una transacción exitosa en MongoDB
 * 
 * @param {object} datosTransaccion - Datos de la transacción
 * @returns {Promise<object>} Resultado de la inserción
 */
async function guardarTransaccion(datosTransaccion) {
  try {
    console.log('💾 [DB] Guardando transacción en MongoDB...');
    
    const transaccion = new Transaccion(datosTransaccion);
    
    // Validar datos
    const { valido, errores } = transaccion.validar();
    if (!valido) {
      console.error('❌ [DB] Datos inválidos:', errores);
      throw new Error(`Datos inválidos: ${errores.join(', ')}`);
    }
    
    const db = await obtenerDB();
    const coleccion = db.collection(COLECCION_TRANSACCIONES);
    
    // Verificar duplicados
    const existe = await coleccion.findOne({ 
      stripeSessionId: datosTransaccion.stripeSessionId 
    });
    
    if (existe) {
      console.warn(`⚠️ [DB] Transacción duplicada: ${datosTransaccion.stripeSessionId}`);
      return { insertedId: existe._id, duplicado: true };
    }
    
    const resultado = await coleccion.insertOne(transaccion.toDocument());
    
    console.log(`✅ [DB] Transacción guardada - ID: ${resultado.insertedId}`);
    
    return { insertedId: resultado.insertedId, duplicado: false };
    
  } catch (error) {
    console.error('❌ [DB] ERROR guardando transacción:', error.message);
    throw error;
  }
}

/**
 * Obtiene las entradas disponibles para una sesión
 * 
 * @param {string} sesionId - ID de la sesión
 * @param {number} capacidadTotal - Capacidad total (default 550)
 * @returns {Promise<number>} Entradas disponibles
 */
async function obtenerDisponibilidad(sesionId, capacidadTotal = 550) {
  try {
    const db = await obtenerDB();
    const coleccion = db.collection(COLECCION_TRANSACCIONES);
    
    // Sumar entradas vendidas
    const resultado = await coleccion.aggregate([
      {
        $match: {
          'sesion.id': sesionId,
          estadoPago: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalVendidas: { $sum: '$entradas.total' }
        }
      }
    ]).toArray();
    
    const vendidas = resultado[0]?.totalVendidas || 0;
    const disponibles = Math.max(0, capacidadTotal - vendidas);
    
    console.log(`📊 [DB] Sesión ${sesionId}: ${disponibles} disponibles (${vendidas} vendidas)`);
    
    return disponibles;
    
  } catch (error) {
    console.error(`❌ [DB] ERROR consultando disponibilidad:`, error.message);
    throw error;
  }
}

/**
 * Obtiene una transacción por su ID de MongoDB
 * 
 * @param {string|ObjectId} transaccionId - ID de la transacción en MongoDB
 * @returns {Promise<object|null>} Transacción encontrada o null
 */
async function obtenerTransaccionPorId(transaccionId) {
  try {
    const db = await obtenerDB();
    const coleccion = db.collection(COLECCION_TRANSACCIONES);
    
    const transaccion = await coleccion.findOne({ 
      _id: new ObjectId(transaccionId) 
    });
    
    if (!transaccion) {
      console.warn(`⚠️ [DB] Transacción no encontrada: ${transaccionId}`);
      return null;
    }
    
    console.log(`✅ [DB] Transacción encontrada - Ticket: ${transaccion.ticketId}`);
    
    return transaccion;
    
  } catch (error) {
    console.error(`❌ [DB] ERROR obteniendo transacción:`, error.message);
    throw error;
  }
}

/**
 * Inicializa índices de MongoDB
 */
async function inicializarIndices() {
  try {
    const db = await obtenerDB();
    const coleccion = db.collection(COLECCION_TRANSACCIONES);
    
    await coleccion.createIndex(
      { stripeSessionId: 1 }, 
      { unique: true, name: 'idx_stripe_session' }
    );
    
    await coleccion.createIndex(
      { 'sesion.id': 1, estadoPago: 1 }, 
      { name: 'idx_sesion_estado' }
    );
    
    // Nuevo índice para ticketId
    await coleccion.createIndex(
      { ticketId: 1 }, 
      { unique: true, name: 'idx_ticket_id' }
    );
    
    console.log('✅ [DB] Índices creados');
    
  } catch (error) {
    if (error.code !== 85) { // 85 = índice ya existe
      console.error('❌ [DB] ERROR creando índices:', error.message);
    }
  }
}

module.exports = {
  guardarTransaccion,
  obtenerDisponibilidad,
  obtenerTransaccionPorId,
  inicializarIndices
};
