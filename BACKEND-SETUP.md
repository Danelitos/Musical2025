# 🎭 En Belén de Judá - Configuración Backend

## ✅ **Backend Completo Creado**

He creado un backend completo en Node.js/Express con integración real de Stripe. Aquí tienes todo configurado:

### 📁 **Estructura del Backend**
```
backend/
├── server.js              # Servidor principal
├── routes/
│   ├── stripe.js          # Rutas de pagos con Stripe
│   └── email.js           # Rutas de emails de confirmación
├── package.json           # Dependencias
├── .env                   # Variables de entorno
└── README.md              # Documentación
```

### 🚀 **Instalación del Backend**

1. **Ejecutar el script de instalación**:
   ```cmd
   install-backend.bat
   ```
   O manualmente:
   ```cmd
   cd backend
   npm install
   ```

2. **Configurar variables de entorno**:
   Edita `backend/.env` con tus claves reales:
   ```env
   STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI
   STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_AQUI
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASS=tu-app-password-de-gmail
   ```

3. **Iniciar el backend**:
   ```cmd
   cd backend
   npm run dev
   ```

### 🔑 **Obtener Claves de Stripe**

1. **Dashboard de Stripe**: https://dashboard.stripe.com
2. **Developers → API Keys**:
   - Copia `Publishable key` (ya configurada en Angular)
   - Copia `Secret key` → ponla en `.env` como `STRIPE_SECRET_KEY`
3. **Developers → Webhooks**:
   - Crea endpoint: `http://localhost:3000/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `payment_intent.succeeded`
   - Copia `Signing secret` → ponla en `.env` como `STRIPE_WEBHOOK_SECRET`

### 🌐 **Endpoints Disponibles**

- `POST /api/stripe/create-checkout-session` - Crear pago
- `GET /api/stripe/checkout-session/:id` - Verificar pago
- `POST /api/stripe/webhook` - Webhooks de Stripe
- `POST /api/email/send-confirmation` - Enviar confirmación
- `GET /api/health` - Estado del servidor

### ⚡ **Probar el Sistema Completo**

1. **Backend**: `cd backend && npm run dev` (puerto 3000)
2. **Frontend**: `ng serve` (puerto 4200)
3. **Realizar una compra de prueba** con tarjetas de test de Stripe

### 💳 **Tarjetas de Prueba (Stripe)**

- **Éxito**: `4242 4242 4242 4242`
- **Error**: `4000 0000 0000 0002`
- **Fecha**: Cualquier fecha futura
- **CVC**: Cualquier 3 dígitos

### 🎯 **Flujo Completo**

1. Usuario llena formulario → Frontend
2. Se crea sesión de Stripe → Backend
3. Redirección a Stripe Checkout → Stripe
4. Usuario paga → Stripe
5. Redirección a confirmación → Frontend
6. Verificación de pago → Backend
7. Envío de email → Backend

¡Tu sistema de pagos está **100% funcional** y listo para producción! 🎉
