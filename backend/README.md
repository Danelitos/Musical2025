# 🎭 En Belén de Judá - Backend API

API REST para la gestión de venta de entradas del musical "En Belén de Judá".

## 🎉 Estado del Proyecto

✅ **PROYECTO COMPLETADO** - La aplicación web está finalizada y en producción.

🌐 **Sitio web:** [enbelendejuda.com](https://enbelendejuda.com)

## 📋 Endpoints Disponibles

### 🎟️ Stripe - Gestión de Pagos

#### `POST /api/stripe/create-checkout-session`
Crea una sesión de pago en Stripe.

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

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

---

#### `GET /api/stripe/sesiones`
Obtiene disponibilidad de todas las sesiones.

**Response:**
```json
{
  "sesiones": [
    {
      "id": "sesion1",
      "fecha": "2025-12-12",
      "hora": "19:00",
      "nombre": "Viernes 12 Dic - 19:00h",
      "disponibles": 550,
      "capacidadTotal": 550,
      "agotado": false
    }
  ]
}
```

---

#### `POST /api/stripe/webhook`
Webhook para eventos de Stripe (uso interno).

**Headers:**
```
stripe-signature: <firma-del-webhook>
```

---

### 📧 Email - Envío de Tickets

#### `POST /api/email/enviar-ticket`
Envía el ticket por email (llamado automáticamente por webhook).

---

### ✅ Validación - Escáner de Entradas

#### `POST /api/validacion/validar`
Valida un ticket escaneado.

**Body:**
```json
{
  "ticketId": "TICKET-1234567890"
}
```

**Response (éxito):**
```json
{
  "valido": true,
  "mensaje": "✅ Entrada válida",
  "ticket": {
    "ticketId": "TICKET-1234567890",
    "sesion": {
      "nombre": "Viernes 12 Dic - 19:00h",
      "fecha": "2025-12-12",
      "hora": "19:00"
    },
    "entradas": {
      "adultos": 2,
      "ninos": 1,
      "total": 3
    },
    "precio": {
      "total": 13,
      "iva": 1.18
    }
  }
}
```

**Response (error):**
```json
{
  "valido": false,
  "mensaje": "❌ Entrada no encontrada",
  "error": "NOT_FOUND"
}
```

---

## 🔒 Seguridad

### Rate Limiting
- **Stripe endpoints**: 10 peticiones/minuto por IP
- **Validación**: 30 peticiones/minuto por IP

### CORS
Configurado para permitir:
- `http://localhost:4200` (desarrollo)
- `https://enbelendejuda.com` (producción)
- `https://*.vercel.app` (preview deploys)

### Headers de Seguridad
- Helmet activado con configuración segura
- Content Security Policy
- HSTS habilitado

---

## 🗄️ Base de Datos

### Colección: `transacciones`

**Esquema:**
```javascript
{
  _id: ObjectId,
  ticketId: String,           // Único, formato TICKET-timestamp
  stripeSessionId: String,    // Único
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
    subtotal: Number,
    iva: Number,
    total: Number,
    desglose: {
      adultos: {
        cantidad: Number,
        precioUnitario: Number,
        precioSinIVA: Number,
        iva: Number,
        total: Number
      },
      ninos: { ... }
    }
  },
  cliente: {
    email: String,
    nombre: String
  },
  estadoPago: String,         // 'paid', 'pending', 'failed'
  fechaCompra: Date,
  validado: Boolean,          // Para control de entrada
  fechaValidacion: Date
}
```

### Índices
- `ticketId` (único)
- `stripeSessionId` (único)
- `sesion.id + estadoPago` (compuesto, para consultas de disponibilidad)

---

## ⚙️ Variables de Entorno

Ver archivo `.env.example` para la lista completa.

---

## 📊 Logs y Monitoreo

Los logs utilizan emojis para fácil identificación:
- 🔌 Conexión a base de datos
- 💾 Operaciones de base de datos
- 💳 Operaciones de Stripe
- 📧 Envío de emails
- ✅ Operaciones exitosas
- ❌ Errores
- ⚠️ Advertencias

---

## 🚀 Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

---

**Documentación completa en:** [README principal](../README.md)
