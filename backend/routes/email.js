const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configurar transporter de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función para generar template de email
function generateEmailTemplate(reservationData) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Reserva - En Belén de Judá</title>
    <style>
        body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #D4AF37, #C41E3A); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .header p { color: #FFF8DC; margin: 10px 0 0 0; font-size: 16px; }
        .content { padding: 30px; }
        .ticket-info { background: #FFF8DC; border-left: 5px solid #D4AF37; padding: 20px; margin: 20px 0; }
        .detail-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px dotted #ddd; }
        .detail-label { font-weight: bold; color: #8B0000; }
        .detail-value { color: #333; }
        .total { background: #8B0000; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .star { color: #FFD700; font-size: 20px; }
        .important { background: #FFE4B5; border: 1px solid #D4AF37; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="star">⭐</span> En Belén de Judá <span class="star">⭐</span></h1>
            <p>¡Tu reserva ha sido confirmada!</p>
        </div>
        
        <div class="content">
            <h2 style="color: #8B0000;">¡Hola ${reservationData.customerName}!</h2>
            
            <p>Nos complace confirmar tu reserva para el musical <strong>"En Belén de Judá"</strong>. 
            Prepárate para vivir una experiencia mágica que tocará tu corazón en esta Navidad.</p>
            
            <div class="ticket-info">
                <h3 style="margin-top: 0; color: #8B0000;">📋 Detalles de tu Reserva</h3>
                
                <div class="detail-row">
                    <span class="detail-label">🎭 Evento:</span>
                    <span class="detail-value">Musical "En Belén de Judá"</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">📅 Fecha:</span>
                    <span class="detail-value">${reservationData.fecha}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">🕐 Hora:</span>
                    <span class="detail-value">${reservationData.hora}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">📍 Lugar:</span>
                    <span class="detail-value">${reservationData.lugar}</span>
                </div>
                
                ${reservationData.numEntradasAdultos > 0 ? `
                <div class="detail-row">
                    <span class="detail-label">🎫 Entradas Adultos:</span>
                    <span class="detail-value">${reservationData.numEntradasAdultos}</span>
                </div>
                ` : ''}
                
                ${reservationData.numEntradasNinos > 0 ? `
                <div class="detail-row">
                    <span class="detail-label">🎫 Entradas Niños:</span>
                    <span class="detail-value">${reservationData.numEntradasNinos}</span>
                </div>
                ` : ''}
                
                <div class="detail-row">
                    <span class="detail-label">💳 Método de Pago:</span>
                    <span class="detail-value">Tarjeta (Stripe)</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">📧 Email:</span>
                    <span class="detail-value">${reservationData.customerEmail}</span>
                </div>
                
                ${reservationData.numeroConfirmacion ? `
                <div class="detail-row">
                    <span class="detail-label">🔑 Número de Confirmación:</span>
                    <span class="detail-value">${reservationData.numeroConfirmacion}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="total">
                💰 Total Pagado: ${reservationData.total}€
            </div>
            
            <div class="important">
                <h4 style="margin-top: 0; color: #8B0000;">📌 Información Importante</h4>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Por favor, llega al teatro 30 minutos antes del espectáculo</li>
                    <li>Presenta este email como comprobante en taquilla</li>
                    <li>Las puertas se abren 15 minutos antes del inicio</li>
                    <li>No se permite el acceso una vez comenzado el espectáculo</li>
                </ul>
            </div>
            
            <h3 style="color: #8B0000;">🏛️ Información del Teatro</h3>
            <p>
                <strong>${process.env.TEATRO_NOMBRE}</strong><br>
                📍 ${process.env.TEATRO_DIRECCION}<br>
                📞 ${process.env.TEATRO_TELEFONO}<br>
                📧 ${process.env.TEATRO_EMAIL}
            </p>
            
            <p style="text-align: center; margin-top: 30px;">
                <strong>¡Esperamos verte pronto! 🎭✨</strong>
            </p>
        </div>
        
        <div class="footer">
            <p><strong>En Belén de Judá</strong> - Donde la fe cobra vida en el escenario</p>
            <p style="margin: 0;">🎄 Un musical que llena de magia la Navidad 🎄</p>
        </div>
    </div>
</body>
</html>
  `;
}

// Enviar email de confirmación
router.post('/send-confirmation', async (req, res) => {
  try {
    const { 
      customerEmail, 
      customerName, 
      fecha, 
      hora, 
      lugar, 
      numEntradas, 
      total 
    } = req.body;

    // Validar datos requeridos
    if (!customerEmail || !customerName || !fecha || !hora || !lugar || !numEntradas || !total) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos para enviar la confirmación' 
      });
    }

    const reservationData = {
      customerEmail,
      customerName,
      fecha,
      hora,
      lugar,
      numEntradas,
      total
    };

    const mailOptions = {
      from: `"En Belén de Judá Musical" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: '🎭 Confirmación de Reserva - En Belén de Judá',
      html: generateEmailTemplate(reservationData)
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email enviado:', info.messageId);
    
    res.json({ 
      success: true, 
      message: 'Email de confirmación enviado correctamente',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({ 
      error: 'Error enviando email de confirmación',
      message: error.message 
    });
  }
});

// Verificar configuración de email
router.get('/test-email-config', async (req, res) => {
  try {
    await transporter.verify();
    res.json({ 
      success: true, 
      message: 'Configuración de email correcta' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error en configuración de email',
      message: error.message 
    });
  }
});

// Función reutilizable para enviar email de confirmación
async function enviarEmailConfirmacion(datosReserva) {
  const { 
    email, 
    nombre, 
    sesion, 
    numEntradas, 
    numeroConfirmacion, 
    precioTotal 
  } = datosReserva;
  
  const reservationData = {
    customerEmail: email,
    customerName: nombre,
    fecha: sesion.fecha,
    hora: sesion.hora,
    lugar: sesion.lugar,
    numEntradas: numEntradas,
    total: precioTotal,
    numeroConfirmacion: numeroConfirmacion
  };

  const mailOptions = {
    from: `"En Belén de Judá Musical" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎭 Confirmación de Compra - En Belén de Judá',
    html: generateEmailTemplate(reservationData)
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✅ Email de confirmación enviado:', info.messageId);
  
  return info;
}

module.exports = { router, enviarEmailConfirmacion };
