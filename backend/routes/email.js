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
                    <li>Presenta este email como comprobante en taquilla</li>
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

// Función reutilizable para enviar email de confirmación
async function enviarEmailConfirmacion(datosReserva) {
  const { 
    email, 
    nombre, 
    sesion, 
    numEntradasAdultos, 
    numEntradasNinos, 
    numeroConfirmacion, 
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
    total: precioTotal,
    numeroConfirmacion: numeroConfirmacion
  };

  const mailOptions = {
    from: `"En Belén de Judá Musical" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✝️ Confirmación de Reserva - En Belén de Judá',
    html: generateEmailTemplate(reservationData)
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✅ Email de confirmación enviado:', info.messageId);
  
  return info;
}

module.exports = { router, enviarEmailConfirmacion };
