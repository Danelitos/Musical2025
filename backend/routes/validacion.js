const express = require('express');
const router = express.Router();
const { obtenerDB } = require('../config/database');
const Transaccion = require('../models/transaccion.model');

/**
 * POST /api/validacion/validar-entrada
 * Valida una entrada escaneando el código QR
 * 
 * Body:
 * {
 *   "ticketId": "BELEN-XXXXX-XXXXX"
 * }
 * 
 * Respuestas:
 * - 200: Entrada válida y marcada como usada
 * - 400: Entrada ya fue validada previamente
 * - 404: Entrada no encontrada
 * - 500: Error del servidor
 */
router.post('/validar-entrada', async (req, res) => {
  try {
    const { ticketId } = req.body;

    // Validar que se envió el ticketId
    if (!ticketId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el código de entrada (ticketId)',
        code: 'TICKET_ID_REQUIRED'
      });
    }

    console.log(`🎫 Validando entrada: ${ticketId}`);

    // Buscar la transacción en la base de datos
    const db = await obtenerDB();
    const transaccionDoc = await db.collection('transacciones').findOne({ 
      ticketId: ticketId 
    });

    // Verificar si existe la entrada
    if (!transaccionDoc) {
      console.log(`❌ Entrada no encontrada: ${ticketId}`);
      return res.status(404).json({
        success: false,
        error: 'Entrada no encontrada',
        code: 'TICKET_NOT_FOUND',
        ticketId
      });
    }

    // Convertir a objeto Transaccion
    const transaccion = Transaccion.fromDocument(transaccionDoc);

    // Verificar si ya fue validada
    if (transaccion.estaValidada()) {
      console.log(`⚠️ Entrada ya validada anteriormente: ${ticketId}`);
      return res.status(400).json({
        success: false,
        error: 'Esta entrada ya fue validada anteriormente',
        code: 'TICKET_ALREADY_USED',
        ticketId,
        detalles: {
          fechaValidacion: transaccion.fechaValidacion,
          nombreCliente: transaccion.customerName,
          emailCliente: transaccion.customerEmail,
          sesion: {
            fecha: transaccion.sesionFecha,
            hora: transaccion.sesionHora,
            lugar: transaccion.sesionLugar
          }
        }
      });
    }

    // Marcar como validada
    transaccion.marcarComoValidada();

    // Actualizar en la base de datos
    await db.collection('transacciones').updateOne(
      { ticketId: ticketId },
      { 
        $set: { 
          entradaValidada: true,
          fechaValidacion: transaccion.fechaValidacion,
          updatedAt: transaccion.updatedAt
        } 
      }
    );

    console.log(`✅ Entrada validada exitosamente: ${ticketId}`);

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Entrada validada correctamente',
      code: 'TICKET_VALIDATED',
      ticketId,
      detalles: {
        nombreCliente: transaccion.customerName,
        emailCliente: transaccion.customerEmail,
        totalEntradas: transaccion.totalEntradas,
        entradasAdultos: transaccion.numEntradasAdultos,
        entradasNinos: transaccion.numEntradasNinos,
        sesion: {
          fecha: transaccion.sesionFecha,
          hora: transaccion.sesionHora,
          lugar: transaccion.sesionLugar
        },
        fechaCompra: transaccion.fechaCompra,
        fechaValidacion: transaccion.fechaValidacion,
        importeTotal: transaccion.importeTotal
      }
    });

  } catch (error) {
    console.error('❌ Error validando entrada:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

/**
 * GET /api/validacion/consultar-entrada/:ticketId
 * Consulta el estado de una entrada sin validarla
 * Útil para verificar información antes de validar
 */
router.get('/consultar-entrada/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    console.log(`🔍 Consultando entrada: ${ticketId}`);

    // Buscar la transacción en la base de datos
    const db = await obtenerDB();
    const transaccionDoc = await db.collection('transacciones').findOne({ 
      ticketId: ticketId 
    });

    // Verificar si existe
    if (!transaccionDoc) {
      return res.status(404).json({
        success: false,
        error: 'Entrada no encontrada',
        code: 'TICKET_NOT_FOUND',
        ticketId
      });
    }

    // Convertir a objeto Transaccion
    const transaccion = Transaccion.fromDocument(transaccionDoc);

    // Devolver información
    res.status(200).json({
      success: true,
      ticketId,
      validada: transaccion.estaValidada(),
      detalles: {
        nombreCliente: transaccion.customerName,
        emailCliente: transaccion.customerEmail,
        totalEntradas: transaccion.totalEntradas,
        entradasAdultos: transaccion.numEntradasAdultos,
        entradasNinos: transaccion.numEntradasNinos,
        sesion: {
          fecha: transaccion.sesionFecha,
          hora: transaccion.sesionHora,
          lugar: transaccion.sesionLugar
        },
        fechaCompra: transaccion.fechaCompra,
        fechaValidacion: transaccion.fechaValidacion,
        importeTotal: transaccion.importeTotal,
        estadoPago: transaccion.estadoPago
      }
    });

  } catch (error) {
    console.error('❌ Error consultando entrada:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

/**
 * GET /api/validacion/estadisticas
 * Obtiene estadísticas de validación
 * Útil para control en tiempo real
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const db = await obtenerDB();
    
    // Contar totales
    const totalEntradas = await db.collection('transacciones').countDocuments();
    const entradasValidadas = await db.collection('transacciones').countDocuments({ 
      entradaValidada: true 
    });
    const entradasPendientes = totalEntradas - entradasValidadas;

    // Obtener últimas validaciones
    const ultimasValidaciones = await db.collection('transacciones')
      .find({ entradaValidada: true })
      .sort({ fechaValidacion: -1 })
      .limit(10)
      .toArray();

    res.status(200).json({
      success: true,
      estadisticas: {
        totalEntradas,
        entradasValidadas,
        entradasPendientes,
        porcentajeValidado: totalEntradas > 0 
          ? ((entradasValidadas / totalEntradas) * 100).toFixed(2) 
          : 0
      },
      ultimasValidaciones: ultimasValidaciones.map(t => ({
        ticketId: t.ticketId,
        nombreCliente: t.customer.name,
        fechaValidacion: t.fechaValidacion,
        totalEntradas: t.entradas.total
      }))
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;
