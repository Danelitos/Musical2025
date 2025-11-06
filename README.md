# 🎭 En Belén de Judá - Musical Website

[![Angular](https://img.shields.io/badge/Angular-20.2-red)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-blue)](https://stripe.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)

Sistema profesional de venta de entradas online para el musical navideño "En Belén de Judá".

## 🎉 Estado del Proyecto

✅ **PROYECTO COMPLETADO** - La aplicación web está finalizada y funcionando en producción.

🌐 **Sitio web en vivo:** [enbelendejuda.com](https://enbelendejuda.com)

## 📋 Tabla de Contenidos

- [🚀 Quick Start](#-quick-start)
- [✨ Características](#-características)
- [🛠️ Tecnologías](#️-tecnologías)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚙️ Configuración](#️-configuración)
- [🚢 Despliegue](#-despliegue)
- [👥 Contacto](#-contacto)

---

## 🚀 Quick Start

### Desarrollo Local

```bash
# 1. Instalar dependencias
npm install
cd backend && npm install && cd ..

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus claves

# 3. Iniciar frontend
npm start

# 4. Iniciar backend (en otra terminal)
cd backend && npm run dev
```

### Producción

🌐 **Sitio en producción**: [enbelendejuda.com](https://enbelendejuda.com)

Ver **[Guía de Producción](backend/PRODUCTION-ENV.md)** para despliegue en Vercel.

---

## ✨ Características

### Frontend (Angular)
- ✅ Diseño responsive adaptado a móviles, tablets y escritorio
- ✅ Carrusel automático de imágenes del musical
- ✅ Sistema de reservas con selección de sesiones
- ✅ Integración con Stripe para pagos seguros
- ✅ Desglose de IVA (10% cultural) en todas las compras
- ✅ Banner de cookies con consentimiento GDPR
- ✅ Páginas legales completas (Privacidad, Términos, Cookies)
- ✅ Footer con redes sociales (Instagram, TikTok, YouTube)
- ✅ Validación de entradas con escáner QR

### Backend (Node.js + Express)
- ✅ API REST con documentación completa
- ✅ Procesamiento de pagos vía Stripe Checkout
- ✅ Webhooks de Stripe para confirmaciones automáticas
- ✅ Sistema de entradas disponibles con control de aforo
- ✅ Envío de emails con Nodemailer
- ✅ Generación de tickets PDF con QR code
- ✅ Seguridad: Helmet, CORS, Rate Limiting
- ✅ Almacenamiento en MongoDB Atlas
- ✅ Logging detallado para debugging

---

## 🛠️ Tecnologías

### Frontend
- **Angular 20+** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Angular Material** - Componentes UI
- **Lucide Icons** - Iconografía moderna
- **SCSS** - Estilos avanzados

### Backend
- **Node.js 18+** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB Atlas** - Base de datos NoSQL en la nube
- **Stripe API** - Procesamiento de pagos
- **Nodemailer** - Envío de emails
- **PDFKit** - Generación de tickets PDF
- **QRCode** - Generación de códigos QR
- **Helmet** - Seguridad HTTP headers
- **CORS** - Control de acceso cross-origin
- **express-rate-limit** - Limitación de peticiones

### Despliegue
- **Vercel** - Hosting y serverless functions
- **MongoDB Atlas** - Base de datos en la nube

---

## 📁 Estructura del Proyecto

```
Musical2025/
├── src/                          # Frontend Angular
│   ├── app/
│   │   ├── components/          # Componentes de la aplicación
│   │   │   ├── home/           # Página principal con reservas
│   │   │   ├── confirmacion/   # Confirmación post-pago
│   │   │   ├── validar-entradas/ # Escáner QR para validación
│   │   │   ├── footer/         # Pie de página
│   │   │   ├── cookie-consent/ # Banner de cookies
│   │   │   ├── politica-privacidad/  # Página legal
│   │   │   ├── terminos-condiciones/ # Página legal
│   │   │   └── politica-cookies/     # Página legal
│   │   ├── services/           # Servicios Angular
│   │   │   ├── stripe.service.ts    # Integración Stripe
│   │   │   └── logger.service.ts    # Sistema de logs
│   │   └── utils/              # Utilidades
│   │       └── precio.utils.ts # Cálculos de IVA
│   ├── assets/                 # Recursos estáticos
│   │   └── images/
│   │       ├── logos/         # Logos e iconos
│   │       └── *.jpg          # Imágenes del carrusel
│   └── environments/          # Configuración por entorno
│
├── backend/                    # Backend Node.js
│   ├── routes/
│   │   ├── stripe.js          # Endpoints de Stripe
│   │   ├── email.js           # Envío de emails y PDFs
│   │   └── validacion.js      # Validación de tickets
│   ├── config/
│   │   └── database.js        # Configuración MongoDB
│   ├── models/
│   │   └── transaccion.model.js # Modelo de datos
│   ├── utils/
│   │   └── precio.utils.js    # Cálculos de IVA (backend)
│   ├── .env.example           # Plantilla de variables de entorno
│   ├── server.js              # Servidor Express
│   ├── package.json
│   └── README.md              # Documentación del backend
│
├── api/                        # Serverless para Vercel
│   └── index.js               # Entry point serverless
├── angular.json               # Configuración de Angular
├── package.json               # Dependencias del frontend
├── tsconfig.json              # Configuración de TypeScript
├── vercel.json                # Configuración de Vercel
└── README.md                  # Este archivo
```

---

## ⚙️ Configuración

### Variables de Entorno (Backend)

Crear `backend/.env` con:

```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password

# Configuración
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200
```

Ver más detalles en [`backend/.env.example`](backend/.env.example)

---

## 🚢 Despliegue

### Producción en Vercel

1. **Conectar repositorio** a Vercel
2. **Configurar variables de entorno** en Vercel Dashboard
3. **Añadir dominio personalizado** (opcional)
4. **Configurar MongoDB Atlas**:
   - Añadir IP `0.0.0.0/0` en Network Access (para Vercel)
   - Verificar string de conexión
5. **Configurar webhook de Stripe** apuntando a tu dominio

Ver **[Guía de Producción](backend/PRODUCTION-ENV.md)** para instrucciones detalladas.

---

## 🎯 Sesiones del Musical

**Diciembre 2025:**
- **Viernes 12** - 19:00h - Teatro Salesianos Deusto (Bilbao)
- **Domingo 21** - 17:00h - Teatro Salesianos Deusto (Bilbao)

**Precios:** Adultos 6€ | Niños 3€ (IVA incluido)  
**Capacidad:** 550 plazas/sesión

---

## 🔐 Seguridad

- ✅ Variables de entorno protegidas
- ✅ Webhooks firmados (Stripe)
- ✅ Rate limiting en endpoints críticos
- ✅ CORS configurado
- ✅ HTTPS obligatorio en producción
- ✅ Helmet para headers de seguridad
- ✅ Validación de datos en backend

---

## 📊 Monitoreo

- **Pagos:** https://dashboard.stripe.com
- **Logs:** Vercel Dashboard → Logs
- **Base de datos:** MongoDB Atlas Dashboard

---

## 👥 Contacto

- 📧 Email: enbelendejuda@gmail.com
- 📱 Instagram: [@enbelendejuda_](https://instagram.com/enbelendejuda_)
- 🎵 TikTok: [@enbelendejuda](https://tiktok.com/@enbelendejuda)
- 📺 YouTube: [En Belén de Judá](https://youtube.com/@enbelendejuda)

---

## 📜 Licencia

© 2025 En Belén de Judá - Todos los derechos reservados

Proyecto privado - Musical "En Belén de Judá"

---

**Desarrollado con ❤️ para el musical "En Belén de Judá"**

🎭 **En Belén de Judá** - Donde la fe cobra vida en el escenario
