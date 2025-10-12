const express = require('express');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
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

        /* CABECERA ACTUALIZADA */
        .header { 
            background-color: #000; 
            padding: 10px 10px; 
            text-align: center; 
        }
        .header img {
            width: 400px;
            height: auto;
            margin-bottom: 10px;
        }

        .content { padding: 30px; }
        .ticket-info { background: #FFF8DC; border-left: 5px solid #D4AF37; padding: 20px; margin: 20px 0; }
        .detail-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px dotted #ddd; }
        .detail-label { font-weight: bold; color: #8B0000; }
        .detail-value { color: #333; }
        .total { background: #8B0000; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; }
        .important { background: #FFE4B5; border: 1px solid #D4AF37; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .star { color: #FFD700; font-size: 18px; margin: 0 8px; }
        
        /* Footer con diseño mejorado y compacto - basado en footer.html y footer.scss */
        .footer { 
            background: #01071f;
            color: white; 
            padding: 20px 15px; 
        }
        .footer-content { 
            max-width: 600px; 
            margin: 0 auto; 
        }
        .footer-section { 
            margin-bottom: 10px; 
        }
        .footer-section h4 {
            color: #D4AF37;
            font-size: 14px;
            margin-bottom: 8px;
            margin-top: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
        }
        .footer-section p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 13px;
            line-height: 1.5;
            margin: 3px 0;
        }
        .footer-section a {
            color: rgba(255, 255, 255, 0.9);
            text-decoration: none;
            transition: color 0.3s ease;
        }
        .footer-section a:hover {
            color: #D4AF37;
        }
        .social-links { 
            margin-top: 8px; 
            margin-bottom: 8px;
        }
        .social-link { 
            color: #D4AF37; 
            text-decoration: none; 
            transition: all 0.3s ease;
        }
        .social-link:hover { 
            opacity: 0.8;
            transform: translateY(-3px);
        }
        .footer-divider {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin: 15px 0;
        }
        .footer-bottom {
            text-align: center;
            color: rgba(255, 255, 255, 0.7);
            font-size: 13px;
            padding-top: 10px;
        }
        
        @media only screen and (max-width: 600px) {
            .footer { padding: 15px 10px; }
            .footer-section { text-align: center; margin-bottom: 8px; }
            .footer-section h4 { font-size: 13px; margin-bottom: 6px; }
            .footer-section p { font-size: 12px; }
            .footer-divider { margin: 10px 0; }
            .footer-bottom { font-size: 12px; padding-top: 8px; }
            table td { display: block !important; width: 100% !important; padding: 5px 0 !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://raw.githubusercontent.com/Danelitos/Musical2025/main/src/assets/images/logo.png" alt="Logo En Belén de Judá">
        </div>
        
        <div class="content">
            <h2 style="color: #8B0000;">¡Hola ${reservationData.customerName}!</h2>
            
            <p>Nos complace confirmar tu reserva para el musical <strong>"En Belén de Judá"</strong>. 
            Prepárate para vivir una experiencia mágica que tocará tu corazón en esta Navidad.</p>
            
            <div class="ticket-info">
                <h3 style="margin-top: 0; color: #8B0000;">📋 Detalles de tu Reserva</h3>
                
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
                    <span class="detail-label">📧 Email:</span>
                    <span class="detail-value">${reservationData.customerEmail}</span>
                </div>
            </div>
            
            <div class="total">
                💰 Total Pagado: ${reservationData.total}€
            </div>
            
            <div class="important">
                <h4 style="margin-top: 0; color: #8B0000;">📌 Información Importante</h4>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Por favor, llega al teatro 30 minutos antes del espectáculo</li>
                    <li>Presenta el PDF adjunto o el código QR en taquilla</li>
                    <li>Las puertas se abren 15 minutos antes del inicio</li>
                </ul>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
                <strong>✨ ¡Esperamos verte pronto! ✨</strong>
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">
                <!-- Sección principal del footer -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 5px;">
                    <tr>
                        <td width="33%" style="vertical-align: top; padding: 0 10px;">
                            <!-- Información de contacto -->
                            <div class="footer-section">
                                <h4 style="color: #D4AF37; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Contacto</h4>
                                <div style="margin-bottom: 8px;">
                                    <p style="color: rgba(255, 255, 255, 0.9); margin: 3px 0; line-height: 1.5;">
                                        📍 <a href="https://maps.app.goo.gl/5ymdFEihjQgNpEJj9" target="_blank" style="color: rgba(255, 255, 255, 0.9); text-decoration: none;">
                                            Teatro Salesianos de Deusto<br>
                                            <span style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">San Felicísimo Bidea, 48014 Bilbao, Bizkaia</span>
                                        </a>
                                    </p>
                                </div>
                                <div>
                                    <p style="color: rgba(255, 255, 255, 0.9); margin: 3px 0; line-height: 1.5;">
                                        📧 <a href="mailto:info@belendejuda.com" style="color: rgba(255, 255, 255, 0.9); text-decoration: none;">info@belendejuda.com</a>
                                    </p>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
                
                <!-- Línea divisoria -->
                <div class="footer-divider"></div>
                
                <!-- Copyright y badges -->
                <div class="footer-bottom">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="text-align: center; padding: 8px 0;">
                                <p style="color: rgba(255, 255, 255, 0.7); font-size: 13px; margin: 0;">
                                    &copy; ${new Date().getFullYear()} En Belén de Judá Musical. Todos los derechos reservados.
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Función para generar código QR con datos de la reserva
async function generarCodigoQR(datosReserva) {
  // Crear texto legible para el QR en vez de JSON
  const datosQRTexto = `plain:
ENTRADA - EN BELÉN DE JUDÁ
━━━━━━━━━━━━━━━━━━━━━━
Nombre: ${datosReserva.nombre}
Fecha: ${datosReserva.sesion.fecha}
Hora: ${datosReserva.sesion.hora}
Lugar: ${datosReserva.sesion.lugar}
━━━━━━━━━━━━━━━━━━━━━━
Entradas Adultos: ${datosReserva.numEntradasAdultos}
Entradas Niños: ${datosReserva.numEntradasNinos}
Total Pagado: ${datosReserva.precioTotal}€
━━━━━━━━━━━━━━━━━━━━━━
Contacto: ${datosReserva.email}`;

  
  // Generar QR como base64
  const qrDataURL = await QRCode.toDataURL(datosQRTexto, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 200,
    margin: 1
  });
  
  return qrDataURL;
}

// Función para generar PDF de la entrada
async function generarPDFEntrada(datosReserva) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const chunks = [];
      
      // Capturar el PDF en memoria
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generar código QR
      const qrCode = await generarCodigoQR(datosReserva);
      
      // Convertir QR de base64 a buffer
      const qrBuffer = Buffer.from(qrCode.split(',')[1], 'base64');

      // ============ ENCABEZADO CON FONDO NEGRO Y LOGO ============
      // Fondo negro elegante en la parte superior
      doc.rect(0, 0, doc.page.width, 180).fill('#000000');
      
      // Logo centrado sobre fondo negro
      const logoPath = path.join(__dirname, '../../src/assets/images/logo.png');
      if (fs.existsSync(logoPath)) {
        const logoWidth = 420;
        const logoX = (doc.page.width - logoWidth) / 2;
        doc.image(logoPath, logoX, 30, {
          width: logoWidth,
          height: 120
        });
      } else {
        // Si no existe el logo, poner título grande en blanco
        doc.fontSize(32).fillColor('#FFFFFF')
           .text('En Belén de Judá', 0, 70, { align: 'center', width: doc.page.width });
      }

      // Borde dorado elegante debajo del header negro
      doc.rect(0, 180, doc.page.width, 4).fill('#D4AF37');

      // Resetear posición Y después del header
      doc.y = 210;

      // ============ TÍTULO DE CONFIRMACIÓN ============
      doc.fontSize(24).fillColor('#8B0000').font('Helvetica-Bold')
         .text('ENTRADA CONFIRMADA', 50, doc.y, { align: 'center', width: doc.page.width - 100 });
      
      // Línea divisoria dorada
      const lineY = doc.y;
      doc.moveTo(80, lineY).lineTo(doc.page.width - 80, lineY).lineWidth(2).stroke('#D4AF37');
      doc.moveDown(0.5);

      // ============ SECCIÓN DE DETALLES DEL EVENTO ============
      // Caja elegante con sombra para detalles del evento
      const eventBoxY = doc.y;
      doc.roundedRect(60, eventBoxY, doc.page.width - 120, 100, 8)
         .lineWidth(1.5)
         .strokeColor('#D4AF37')
         .fillAndStroke('#FFF8DC', '#D4AF37');

      doc.fontSize(15).fillColor('#8B0000').font('Helvetica-Bold')
         .text('Detalles del Evento', 80, eventBoxY + 15);
      
      doc.fontSize(11).fillColor('#000').font('Helvetica');
      
      // Información del evento sin emojis
      const detailsY = eventBoxY + 40;
      doc.font('Helvetica-Bold').text('Fecha:', 80, detailsY);
      doc.font('Helvetica').fillColor('#333').text(datosReserva.sesion.fecha, 160, detailsY);
      
      doc.font('Helvetica-Bold').fillColor('#000').text('Hora:', 80, detailsY + 18);
      doc.font('Helvetica').fillColor('#333').text(datosReserva.sesion.hora, 160, detailsY + 18);
      
      doc.font('Helvetica-Bold').fillColor('#000').text('Lugar:', 80, detailsY + 36);
      doc.font('Helvetica').fillColor('#333').text(datosReserva.sesion.lugar, 160, detailsY + 36, {
        width: doc.page.width - 240
      });

      doc.y = eventBoxY + 115;
      doc.moveDown(1);

      // ============ TABLA DE ENTRADAS ============
      doc.fontSize(15).fillColor('#8B0000').font('Helvetica-Bold')
         .text('Entradas Adquiridas', 60, doc.y);
      doc.moveDown(0.8);

      let tableY = doc.y;
      const tableX = 60;
      const tableWidth = doc.page.width - 120;
      
      // Definir anchos de columnas
      const col1Width = 120;  // Tipo
      const col2Width = 100;  // Cantidad
      const col3Width = 120;  // Precio Unit.
      const col4Width = 120;  // Subtotal
      
      // Encabezados de tabla con degradado
      doc.roundedRect(tableX, tableY, tableWidth, 28, 5)
         .fillAndStroke('#8B0000', '#6B0000');
      
      doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold');
      doc.text('Tipo', tableX + 10, tableY + 8, { width: col1Width, align: 'left' });
      doc.text('Cantidad', tableX + col1Width + 10, tableY + 8, { width: col2Width, align: 'center' });
      doc.text('Precio Unit.', tableX + col1Width + col2Width + 10, tableY + 8, { width: col3Width, align: 'center' });
      doc.text('Subtotal', tableX + col1Width + col2Width + col3Width + 10, tableY + 8, { width: col4Width - 10, align: 'right' });
      
      tableY += 28;

      // Filas de entradas con fondo alternado
      doc.font('Helvetica');
      
      // Fila Adultos
      if (datosReserva.numEntradasAdultos > 0) {
        doc.rect(tableX, tableY, tableWidth, 23).fillAndStroke('#F8F8F8', '#E0E0E0');
        doc.fillColor('#000').text('Adulto', tableX + 10, tableY + 6, { width: col1Width, align: 'left' });
        doc.text(datosReserva.numEntradasAdultos.toString(), tableX + col1Width + 10, tableY + 6, { width: col2Width, align: 'center' });
        doc.text(`${datosReserva.sesion.precioAdulto}€`, tableX + col1Width + col2Width + 10, tableY + 6, { width: col3Width, align: 'center' });
        doc.text(`${(datosReserva.numEntradasAdultos * datosReserva.sesion.precioAdulto).toFixed(2)}€`, tableX + col1Width + col2Width + col3Width + 10, tableY + 6, { width: col4Width - 10, align: 'right' });
        tableY += 23;
      }

      // Fila Niños
      if (datosReserva.numEntradasNinos > 0) {
        doc.rect(tableX, tableY, tableWidth, 23).fillAndStroke('#FFFFFF', '#E0E0E0');
        doc.fillColor('#000').text('Niño', tableX + 10, tableY + 6, { width: col1Width, align: 'left' });
        doc.text(datosReserva.numEntradasNinos.toString(), tableX + col1Width + 10, tableY + 6, { width: col2Width, align: 'center' });
        doc.text(`${datosReserva.sesion.precioNino}€`, tableX + col1Width + col2Width + 10, tableY + 6, { width: col3Width, align: 'center' });
        doc.text(`${(datosReserva.numEntradasNinos * datosReserva.sesion.precioNino).toFixed(2)}€`, tableX + col1Width + col2Width + col3Width + 10, tableY + 6, { width: col4Width - 10, align: 'right' });
        tableY += 23;
      }

      // Total destacado
      doc.roundedRect(tableX, tableY, tableWidth, 32, 5)
         .fillAndStroke('#D4AF37', '#B8941F');
      doc.fontSize(14).fillColor('#000').font('Helvetica-Bold')
         .text('TOTAL PAGADO', tableX + 10, tableY + 9, { width: col1Width + col2Width, align: 'left' });
      doc.fontSize(16)
         .text(`${datosReserva.precioTotal}€`, tableX + col1Width + col2Width + col3Width + 10, tableY + 8, { width: col4Width - 10, align: 'right' });

      doc.y = tableY + 45;
      doc.moveDown(1.2);

      // ============ CÓDIGO QR CON MARCO ELEGANTE ============
      doc.fontSize(14).fillColor('#8B0000').font('Helvetica-Bold')
         .text('Código de Validación', 0, doc.y, { align: 'center', width: doc.page.width });
      doc.moveDown(0.8);

      // Marco elegante para el QR
      const qrBoxSize = 190;
      const qrBoxX = (doc.page.width - qrBoxSize) / 2;
      const qrBoxY = doc.y;
      
      doc.roundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 8)
         .lineWidth(2.5)
         .strokeColor('#D4AF37')
         .fillAndStroke('#FFFFFF', '#D4AF37');

      // QR centrado dentro del marco
      const qrSize = 160;
      const qrX = qrBoxX + (qrBoxSize - qrSize) / 2;
      const qrY = qrBoxY + (qrBoxSize - qrSize) / 2;
      doc.image(qrBuffer, qrX, qrY, { width: qrSize });
      
      doc.y = qrBoxY + qrBoxSize + 12;

      doc.fontSize(9).fillColor('#666').font('Helvetica')
         .text('Presente este código QR en la entrada del evento', 0, doc.y, { align: 'center', width: doc.page.width });

      // ============ FOOTER PÁGINA 1 ============
      const footerY1 = doc.page.height - 40;
      doc.fontSize(8).fillColor('#999').font('Helvetica')
         .text(`© ${new Date().getFullYear()} En Belén de Judá Musical - Todos los derechos reservados`, 0, footerY1, {
           align: 'center',
           width: doc.page.width
         });

      // ============ NUEVA PÁGINA PARA INFORMACIÓN IMPORTANTE ============
      doc.addPage();

      // Fondo negro elegante en la parte superior de la página 2
      doc.rect(0, 0, doc.page.width, 180).fill('#000000');
      
      // Logo centrado sobre fondo negro en página 2
      if (fs.existsSync(logoPath)) {
        const logoWidth = 420;
        const logoX = (doc.page.width - logoWidth) / 2;
        doc.image(logoPath, logoX, 30, {
          width: logoWidth,
          height: 120
        });
      } else {
        doc.fontSize(32).fillColor('#FFFFFF')
           .text('En Belén de Judá', 0, 70, { align: 'center', width: doc.page.width });
      }

      // Borde dorado elegante debajo del header negro
      doc.rect(0, 180, doc.page.width, 4).fill('#D4AF37');

      // Posición inicial del contenido en página 2
      doc.y = 230;

      // ============ INFORMACIÓN IMPORTANTE EN PÁGINA 2 ============
      const infoBoxY = doc.y;
      const infoBoxHeight = 150;
      
      doc.roundedRect(60, infoBoxY, doc.page.width - 120, infoBoxHeight, 8)
         .lineWidth(1.5)
         .fillAndStroke('#FFF8DC', '#D4AF37');
      
      doc.fontSize(18).fillColor('#8B0000').font('Helvetica-Bold')
         .text('Información Importante', 0, infoBoxY + 25, { align: 'center', width: doc.page.width });
      
      doc.moveDown(1.5);
      
      doc.fontSize(12).fillColor('#333').font('Helvetica')
         .text('• Llegue 30 minutos antes del inicio del evento', 80, infoBoxY + 65, { width: doc.page.width - 160 })
         .moveDown(0.8)
         .text('• Presente este PDF o el código QR en taquilla', 80, doc.y, { width: doc.page.width - 160 })
         .moveDown(0.8)
         .text('• Las puertas se abren 15 minutos antes del espectáculo', 80, doc.y, { width: doc.page.width - 160 });

      // ============ FOOTER PÁGINA 2 ============
      const footerY2 = doc.page.height - 40;
      doc.fontSize(8).fillColor('#999').font('Helvetica')
         .text(`© ${new Date().getFullYear()} En Belén de Judá Musical - Todos los derechos reservados`, 0, footerY2, {
           align: 'center',
           width: doc.page.width
         });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Función reutilizable para enviar email de confirmación
async function enviarEmailConfirmacion(datosReserva) {
  const { 
    email, 
    nombre, 
    sesion, 
    numEntradasAdultos, 
    numEntradasNinos, 
    precioTotal 
  } = datosReserva;
  
  const reservationData = {
    customerEmail: email,
    customerName: nombre,
    fecha: sesion.fecha,
    hora: sesion.hora,
    lugar: sesion.lugar,
    numEntradasAdultos: numEntradasAdultos,
    numEntradasNinos: numEntradasNinos,
    total: precioTotal
  };

  // Generar PDF de la entrada
  const pdfBuffer = await generarPDFEntrada(datosReserva);

  // Generar nombre único para el PDF usando timestamp
  const timestamp = new Date().getTime();
  const pdfFilename = `Entrada_BelenDeJuda_${timestamp}.pdf`;

  const mailOptions = {
    from: `"En Belén de Judá Musical" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✝️ Confirmación de Reserva - En Belén de Judá',
    html: generateEmailTemplate(reservationData),
    attachments: [
      {
        filename: pdfFilename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✅ Email de confirmación enviado:', info.messageId);
  
  return info;
}

/**
 * GET /api/email/test-config
 * Endpoint para verificar la configuración del email (solo para debugging)
 */
router.get('/test-config', async (req, res) => {
  try {
    console.log('🔍 Verificando configuración de email...');
    
    const config = {
      emailUser: process.env.EMAIL_USER ? '✅ Configurado' : '❌ NO configurado',
      emailPass: process.env.EMAIL_PASS ? '✅ Configurado' : '❌ NO configurado',
      emailHost: process.env.EMAIL_HOST || 'Gmail (por defecto)',
      emailPort: process.env.EMAIL_PORT || '587 (por defecto)',
    };
    
    console.log('Configuración:', config);
    
    // Intentar verificar conexión
    let connectionStatus = 'No probada';
    try {
      await transporter.verify();
      connectionStatus = '✅ Conexión exitosa';
      console.log('✅ Conexión con servidor de email verificada');
    } catch (error) {
      connectionStatus = `❌ Error: ${error.message}`;
      console.error('❌ Error verificando conexión:', error.message);
    }
    
    res.json({
      status: 'OK',
      config: {
        emailUser: process.env.EMAIL_USER,
        emailUserConfigured: !!process.env.EMAIL_USER,
        emailPassConfigured: !!process.env.EMAIL_PASS,
        emailHost: process.env.EMAIL_HOST || 'gmail (default)',
        emailPort: process.env.EMAIL_PORT || '587',
        connectionStatus: connectionStatus
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en test-config:', error);
    res.status(500).json({
      error: 'Error verificando configuración',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/email/test-send
 * Endpoint para enviar un email de prueba (solo para debugging)
 */
router.post('/test-send', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }
    
    console.log(`📧 Enviando email de prueba a: ${email}`);
    
    const mailOptions = {
      from: `"En Belén de Judá Musical - TEST" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🧪 Email de Prueba - En Belén de Judá',
      html: `
        <h2>Email de Prueba</h2>
        <p>Este es un email de prueba del sistema de En Belén de Judá.</p>
        <p>Si recibes este email, la configuración está funcionando correctamente.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email de prueba enviado:', info.messageId);
    
    res.json({
      status: 'OK',
      message: 'Email de prueba enviado exitosamente',
      messageId: info.messageId,
      response: info.response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error enviando email de prueba:', error);
    res.status(500).json({
      error: 'Error enviando email de prueba',
      message: error.message,
      code: error.code,
      response: error.response,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = { router, enviarEmailConfirmacion };
