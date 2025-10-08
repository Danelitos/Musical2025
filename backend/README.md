# Backend - Musical "En Belén de Judá"

Backend en Node.js/Express para manejar pagos con Stripe y envío de emails de confirmación.

## 🚀 Instalación

```bash
cd backend
npm install
```

## ⚙️ Configuración

### 1. Variables de Entorno

Edita el archivo `.env` con tus credenciales reales:

```env
# Stripe (OBLIGATORIO)
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# Email (Opcional - para confirmaciones)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-gmail
```

### 2. Configurar Stripe Webhooks

1. Ve a tu dashboard de Stripe → **Developers** → **Webhooks**
2. Crea un nuevo endpoint: `http://localhost:3000/api/stripe/webhook`
3. Selecciona estos eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copia el **Signing Secret** y ponlo en `STRIPE_WEBHOOK_SECRET`

### 3. Configurar Email (Gmail)

1. Habilita la autenticación de 2 factores en Gmail
2. Genera una "App Password": [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Usa esa contraseña en `EMAIL_PASS`

## 🏃‍♂️ Ejecutar

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor se ejecuta en: `http://localhost:3000`

## 📡 Endpoints API

### Stripe
- `POST /api/stripe/create-checkout-session` - Crear sesión de pago
- `GET /api/stripe/checkout-session/:sessionId` - Obtener detalles del pago
- `POST /api/stripe/webhook` - Webhook de Stripe
- `GET /api/stripe/sesiones` - Obtener sesiones disponibles

### Email
- `POST /api/email/send-confirmation` - Enviar confirmación
- `GET /api/email/test-email-config` - Probar configuración

### Utilidad
- `GET /api/health` - Estado del servidor

## 🧪 Probar

### 1. Verificar servidor
```bash
curl http://localhost:3000/api/health
```

### 2. Probar configuración de email
```bash
curl http://localhost:3000/api/email/test-email-config
```

### 3. Obtener sesiones
```bash
curl http://localhost:3000/api/stripe/sesiones
```

## 🔐 Seguridad

- ✅ CORS configurado solo para el frontend
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet para headers de seguridad
- ✅ Variables de entorno para secretos
- ✅ Validación de webhooks de Stripe

## 🚨 Importante

- Nunca subas el archivo `.env` al repositorio
- Usa siempre HTTPS en producción
- Configura los webhooks de Stripe en producción
- Cambia las URLs de éxito/cancelación para producción
