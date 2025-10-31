# 🎭 Backend - Musical "En Belén de Judá"

Backend del sistema de venta de entradas para el musical "En Belén de Judá".

## 📋 Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Endpoints de la API](#endpoints-de-la-api)
- [Webhooks de Stripe](#webhooks-de-stripe)
- [Despliegue](#despliegue)

## 🛠️ Tecnologías

- **Node.js** (v18+)
- **Express.js** - Framework web
- **Stripe** - Procesamiento de pagos
- **Nodemailer** - Envío de emails
- **PDFKit** - Generación de tickets PDF
- **dotenv** - Gestión de variables de entorno
- **helmet** - Seguridad HTTP
- **cors** - Control de acceso CORS
- **express-rate-limit** - Limitación de peticiones

## 📁 Estructura del Proyecto

```
backend/
├── routes/
│   ├── stripe.js          # Endpoints de Stripe (checkout, sesiones, webhook)
│   └── email.js           # Endpoints de envío de emails y PDFs
├── utils/
│   └── precio.utils.js    # Utilidades para cálculo de IVA
├── .env.example           # Plantilla de variables de entorno
├── server.js              # Configuración principal del servidor
├── package.json           # Dependencias y scripts
└── README.md              # Este archivo
```

## 📦 Instalación

```bash
cd backend
npm install
```

## ⚙️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# URLs de redirección
SUCCESS_URL=http://localhost:4200/confirmacion
CANCEL_URL=http://localhost:4200

# Stripe
STRIPE_SECRET_KEY=sk_test_tu_clave_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui

# Email
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
```

### 2. Configurar Stripe

1. **Crear cuenta en Stripe**: https://dashboard.stripe.com/register
2. **Obtener claves de API**:
   - Ve a https://dashboard.stripe.com/test/apikeys
   - Copia tu "Secret key" a `STRIPE_SECRET_KEY`

### 3. Configurar Webhooks (IMPORTANTE)

Para que las entradas se descuenten correctamente al completar una compra:

**Opción A: Desarrollo Local (Recomendado)**

```bash
# Instalar Stripe CLI
# Windows: Descargar desde https://github.com/stripe/stripe-cli/releases
# macOS: brew install stripe/stripe-cli/stripe

# Autenticarse
stripe login

# Reenviar webhooks a tu servidor local
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

Copia el webhook secret que aparece (empieza con `whsec_`) a tu `.env`.

**Opción B: Producción**

1. Ve a https://dashboard.stripe.com/webhooks
2. Click en "Añadir endpoint"
3. URL: `https://tu-dominio.com/api/stripe/webhook`
4. Selecciona eventos:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `checkout.session.async_payment_failed`
5. Copia el "Signing secret" a `STRIPE_WEBHOOK_SECRET`

### 4. Configurar Email (Nodemailer)

**Para Gmail:**

1. Activa la verificación en 2 pasos en tu cuenta de Google
2. Ve a https://myaccount.google.com/apppasswords
3. Genera una "Contraseña de aplicación"
4. Usa esa contraseña en `EMAIL_PASS`

**Para otros proveedores:**

Edita `routes/email.js` con la configuración SMTP correspondiente.

## 🚀 Ejecución

### Desarrollo

```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

### Verificar que funciona

```bash
curl http://localhost:3000/api/health
```

Deberías ver:
```json
{
  "status": "OK",
  "message": "Backend del Musical En Belén de Judá funcionando correctamente",
  "timestamp": "2025-10-31T..."
}
```

## 📡 Endpoints de la API

### Health Check

```http
GET /api/health
```

Verifica el estado del servidor.

### Stripe - Sesiones Disponibles

```http
GET /api/stripe/sesiones
```

Retorna las sesiones del musical con entradas disponibles.

**Respuesta:**
```json
[
  {
    "id": "1",
    "fecha": "2025-12-12",
    "hora": "20:00",
    "lugar": "Teatro Salesianos de Deusto (Bilbao)",
    "precioAdulto": 5,
    "precioNino": 3,
    "entradasDisponibles": 550
  }
]
```

### Stripe - Crear Sesión de Checkout

```http
POST /api/stripe/create-checkout-session
```

Crea una sesión de pago en Stripe.

**Body:**
```json
{
  "customerEmail": "usuario@example.com",
  "customerName": "Juan Pérez",
  "sesionId": "1",
  "numEntradasAdultos": 2,
  "numEntradasNinos": 1,
  "sesionInfo": {
    "fecha": "12/12/2025",
    "hora": "20:00",
    "lugar": "Teatro Salesianos de Deusto"
  }
}
```

**Respuesta:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Stripe - Obtener Sesión de Checkout

```http
GET /api/stripe/checkout-session/:sessionId
```

Obtiene detalles de una sesión de pago completada.

### Stripe - Webhook

```http
POST /api/stripe/webhook
```

Endpoint para recibir eventos de Stripe. **No llamar manualmente.**

Eventos manejados:
- `checkout.session.completed` → Descuenta entradas y envía email
- `checkout.session.expired` → Log informativo
- `checkout.session.async_payment_failed` → Log informativo

### Email - Enviar Confirmación Manual

```http
POST /api/email/enviar-confirmacion
```

Envía email de confirmación manualmente (principalmente para testing).

## 🔔 Webhooks de Stripe

El sistema usa webhooks para garantizar que las entradas solo se descuenten cuando un pago se completa exitosamente.

**Flujo:**

1. Usuario inicia checkout → Backend verifica disponibilidad (NO descuenta aún)
2. Usuario paga en Stripe → Stripe envía evento `checkout.session.completed`
3. Webhook recibe evento → Backend descuenta entradas + envía email con PDF

**Ver logs del webhook:**

```bash
# En desarrollo con Stripe CLI
stripe listen --forward-to http://localhost:3000/api/stripe/webhook --print-secret

# En producción
# Revisa los logs del servidor o Stripe Dashboard → Webhooks → Attempts
```

## 🌐 Despliegue

### Vercel (Recomendado)

El proyecto ya está configurado para Vercel con el archivo `../vercel.json`.

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd ..
vercel
```

**Variables de entorno en Vercel:**

Ve a tu proyecto en Vercel → Settings → Environment Variables y añade:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `FRONTEND_URL`
- `SUCCESS_URL`
- `CANCEL_URL`

### Otros Servicios

El backend es compatible con cualquier servicio que soporte Node.js:
- Azure App Service
- AWS Lambda
- Google Cloud Run
- Railway
- Render

## 🔒 Seguridad

- **Helmet**: Protección de headers HTTP
- **Rate Limiting**: Máximo 100 requests por IP cada 15 minutos
- **CORS**: Solo acepta peticiones del frontend autorizado
- **Webhook Signature**: Verifica que los eventos vienen de Stripe
- **Environment Variables**: Datos sensibles en `.env` (nunca en el código)

## 📊 Sistema de Entradas

Las entradas disponibles se gestionan de la siguiente manera:

- **Verificación**: Al crear checkout se verifica disponibilidad
- **Descuento**: Solo cuando el pago se completa (vía webhook)
- **Cancelación**: Si el usuario cancela, las entradas NO se descuentan
- **Expiración**: Las sesiones de Stripe expiran en 30 minutos

⚠️ **IMPORTANTE**: Actualmente las sesiones están en memoria (array hardcodeado). Para producción se recomienda migrar a una base de datos como **Azure Cosmos DB**.

## 🐛 Debugging

### Ver logs detallados

Los logs incluyen emojis para facilitar la identificación:

- 🎭 Inicio del servidor
- ✅ Operación exitosa
- ❌ Error
- ⚠️ Advertencia
- 📧 Email enviado
- 🔔 Webhook recibido
- 📊 Entradas actualizadas

### Problemas comunes

**Error: STRIPE_SECRET_KEY no configurada**
→ Verifica que `.env` existe y tiene la clave correcta

**Webhooks no llegan**
→ Usa Stripe CLI en desarrollo: `stripe listen --forward-to http://localhost:3000/api/stripe/webhook`

**Email no se envía**
→ Verifica `EMAIL_USER` y `EMAIL_PASS`. Si usas Gmail, asegúrate de usar una App Password.

**Entradas no se descuentan**
→ Verifica que el webhook está configurado y funcionando. Revisa los logs al completar un pago.

## 📞 Soporte

Para más información:
- [Documentación de Stripe](https://stripe.com/docs)
- [Documentación de Nodemailer](https://nodemailer.com/)
- [Documentación de Express](https://expressjs.com/)

## 📝 Licencia

Proyecto privado - Musical "En Belén de Judá"
