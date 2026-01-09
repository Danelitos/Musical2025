# 🎭 En Belén de Judá - Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.3-green)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-14.5-blue)](https://stripe.com/)

API REST para la gestión de venta de entradas del musical "En Belén de Judá". Procesamiento de pagos, generación de tickets PDF con QR, envío de emails y validación de entradas.

🌐 **API en producción:** `https://enbelendejuda.com/api`

---

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

---

## 📋 Endpoints

### Stripe - Pagos

#### `POST /api/stripe/create-checkout-session`
Crea una sesión de pago.

**Body:**
```json
{
  "sesion": {
    "id": "sesion1",
    "fecha": "2025-12-12",
    "hora": "19:00",
    "nombre": "Viernes 12 Dic - 19:00h"
  },
  "entradas": {
    "adultos": 2,
    "ninos": 1
  }
}
```

#### `GET /api/stripe/sesiones`
Obtiene disponibilidad de sesiones.

#### `POST /api/stripe/webhook`
Webhook de Stripe (uso interno).

### Validación

#### `POST /api/validacion/validar`
Valida un ticket escaneado.

**Body:**
```json
{
  "ticketId": "TICKET-1234567890"
}
```

---

## ⚙️ Variables de Entorno

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # App Password de Gmail

# General
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200
```

### Configurar Gmail

1. Activar verificación en 2 pasos
2. Ir a: https://myaccount.google.com/apppasswords
3. Generar App Password
4. Usar en `EMAIL_PASS`

### Configurar Stripe Webhook

1. Ir a [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Añadir endpoint: `https://tu-dominio.com/api/stripe/webhook`
3. Seleccionar evento: `checkout.session.completed`
4. Copiar signing secret a `STRIPE_WEBHOOK_SECRET`

---

## 🗄️ Base de Datos

### MongoDB Atlas

**Colección:** `transacciones`

**Esquema:**
```javascript
{
  ticketId: String,           // TICKET-{timestamp}
  stripeSessionId: String,
  sesion: {
    id: String,
    fecha: String,
    hora: String,
    nombre: String
  },
  entradas: {
    adultos: Number,
    ninos: Number,
    total: Number
  },
  precio: {
    total: Number,
    iva: Number,
    subtotal: Number
  },
  cliente: {
    email: String,
    nombre: String
  },
  estadoPago: String,         // 'paid', 'pending', 'failed'
  validado: Boolean,
  fechaCompra: Date
}
```

**Índices:**
- `ticketId` (único)
- `stripeSessionId` (único)
- `sesion.id + estadoPago` (compuesto)

---

## 🔒 Seguridad

- ✅ Helmet (protección headers HTTP)
- ✅ CORS configurado
- ✅ Rate limiting (prevención de abuso)
- ✅ Validación de webhooks de Stripe
- ✅ Variables de entorno para secretos
- ✅ HTTPS obligatorio en producción

---

## 📊 Logs

Sistema de logging con emojis:

```
🔌 Conexión a BD
💳 Operaciones Stripe
📧 Envío de emails
✅ Éxito
❌ Errores
```

---

## 🏗️ Arquitectura

```
Usuario → Frontend → API REST
                  ↓
            MongoDB Atlas (transacciones)
            Stripe API (pagos)
            Gmail SMTP (tickets)
```

**Flujo de compra:**
1. Usuario paga en Stripe Checkout
2. Webhook confirma pago
3. Guardar transacción en MongoDB
4. Generar PDF con QR
5. Enviar ticket por email

---

## 📜 Licencia

© 2025 Asociación Cultural En Belén de Judá - Todos los derechos reservados

---

**Documentación completa:** [README principal](../README.md)
