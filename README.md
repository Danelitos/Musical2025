# 🎭 En Belén de Judá - Musical Website

[![Angular](https://img.shields.io/badge/Angular-20.2-red)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-blue)](https://stripe.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com/)

Plataforma web completa para la venta de entradas del musical navideño "En Belén de Judá". Sistema con pagos seguros con Stripe, generación automática de tickets PDF con QR y validación de entradas.

🌐 **Sitio en producción:** [enbelendejuda.com](https://enbelendejuda.com)

---

## ✨ Características

- 🎟️ **Compra online** - Sistema de reserva y pago con Stripe Checkout
- 📧 **Tickets automáticos** - PDF con código QR único enviado por email
- ✅ **Validación de entradas** - Escáner QR para control de acceso
- 📊 **Control de aforo** - Gestión en tiempo real de plazas disponibles
- 📱 **Responsive** - Diseño adaptado a todos los dispositivos
- 🔒 **Seguro** - Cumplimiento GDPR/LOPD, pagos con PCI DSS

---

## 🛠️ Tecnologías

### Frontend
- **Angular 20** + TypeScript
- **Angular Material** - Componentes UI
- **Stripe.js** - Integración de pagos
- **html5-qrcode** - Escáner QR

### Backend
- **Node.js** + Express
- **MongoDB Atlas** - Base de datos cloud
- **Stripe API** - Procesamiento de pagos
- **Nodemailer** - Envío de emails
- **PDFKit** + **QRCode** - Generación de tickets

### Infraestructura
- **Vercel** - Hosting frontend + serverless functions
- **MongoDB Atlas** - Base de datos (M0 Free Tier)
- **Gmail SMTP** - Servicio de email

---

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/musical2025.git
cd musical2025

# Instalar dependencias
npm install
cd backend && npm install && cd ..

# Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales

# Iniciar desarrollo
npm start                    # Frontend (puerto 4200)
cd backend && npm run dev    # Backend (puerto 3000)
```

### Variables de Entorno

Crear `backend/.env` con:

```env
MONGODB_URI=mongodb+srv://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=app-password
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200
```

---

## 📁 Estructura del Proyecto

```
Musical2025/
├── src/                    # Frontend Angular
│   ├── app/components/    # Componentes (home, checkout, validación)
│   ├── app/services/      # Servicios (Stripe, logger)
│   └── assets/            # Imágenes y recursos
├── backend/               # Backend Node.js
│   ├── routes/           # Endpoints API (stripe, email, validación)
│   ├── config/           # Configuración MongoDB
│   ├── models/           # Esquemas de datos
│   └── utils/            # Utilidades (cálculo IVA)
├── api/                  # Serverless function para Vercel
└── vercel.json           # Configuración de despliegue
```

---

## 🚢 Despliegue en Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Dashboard
3. Configurar MongoDB Atlas (Network Access: `0.0.0.0/0`)
4. Configurar webhook de Stripe: `https://tu-dominio.com/api/stripe/webhook`
5. Deploy automático ✨

---

## 🎭 Sobre el Musical

**En Belén de Judá** - Musical navideño  
**Lugar:** Teatro Salesianos Deusto, Bilbao  
**Capacidad:** 550 plazas/sesión

**Sesiones (Diciembre 2025):**
- Viernes 12 - 19:00h
- Domingo 21 - 17:00h
- Domingo 21 - 19:30h

**Precios:**
- Adultos: 6€ (IVA incluido)
- Niños: 3€ (IVA incluido)

---

## 👥 Contacto

- 📧 **Email:** enbelendejuda@gmail.com
- 📱 **Instagram:** [@enbelendejuda](https://instagram.com/enbelendejuda)
- 🎵 **TikTok:** [@enbelendejuda](https://tiktok.com/@enbelendejuda)
- 📺 **YouTube:** [En Belén de Judá](https://youtube.com/@enbelendejuda)

---

## 📜 Licencia

© 2025 Asociación Cultural En Belén de Judá - Todos los derechos reservados

---

**Desarrollado con ❤️ para la Asociación Cultural En Belén de Judá**
