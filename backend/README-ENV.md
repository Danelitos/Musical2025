# Backend - En Belén de Judá Musical

Backend del sistema de venta de entradas para el musical "En Belén de Judá".

## Variables de Entorno

El backend utiliza variables de entorno para configuración sensible y específica del entorno.

### Desarrollo Local

Para desarrollo local, usa el archivo `.env`:
```bash
cp .env .env.local  # Si quieres hacer cambios locales
```

El archivo `.env` contiene:
- Claves de Stripe en modo **test** (`sk_test_...`, `pk_test_...`)
- URLs de localhost para frontend, success y cancel
- Credenciales de email para desarrollo

### Producción (Vercel)

**IMPORTANTE:** No subir `.env` ni `.env.production` al repositorio.

Para producción en Vercel:

1. Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**

2. Añade las siguientes variables (marca las sensibles como "Secret"):

   **Stripe (LIVE keys - ¡Obligatorio cambiar!):**
   - `STRIPE_SECRET_KEY` = `sk_live_...` (tu clave secreta LIVE)
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (webhook secret de producción)

   **URLs de Producción:**
   - `FRONTEND_URL` = `https://enbelendejuda.com`
   - `SUCCESS_URL` = `https://enbelendejuda.com/confirmacion`
   - `CANCEL_URL` = `https://enbelendejuda.com`

   **Email (marcar como Secret):**
   - `EMAIL_HOST` = `smtp.gmail.com`
   - `EMAIL_PORT` = `587`
   - `EMAIL_USER` = `enbelendejuda@gmail.com`
   - `EMAIL_PASS` = `[tu app password de Gmail]`

   **Servidor:**
   - `NODE_ENV` = `production` (Vercel lo establece automáticamente)
   - `PORT` = no es necesario en Vercel (Vercel controla el puerto)

   **Datos del Teatro (opcionales, pueden ir en código):**
   - `TEATRO_NOMBRE` = `Teatro de Deusto`
   - `TEATRO_DIRECCION` = `Universidad de Deusto, Bilbao`
   - `TEATRO_TELEFONO` = `+34 944 139 000`
   - `TEATRO_EMAIL` = `info@deusto.es`

3. **Aplicar por entorno:**
   - Para Production: selecciona "Production"
   - Para Preview: selecciona "Preview" (puedes usar keys de test)

4. Redeploy el proyecto para que las variables tomen efecto.

### Verificación

Para verificar que las variables están configuradas correctamente:

```bash
# Local
node -e "require('dotenv').config(); console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY?.slice(0, 20) + '...')"

# En Vercel (logs del deploy)
# Verifica que process.env.STRIPE_SECRET_KEY existe (sin imprimir el valor completo)
```

## Estructura de Archivos

```
backend/
├── .env                    # Desarrollo (NO subir a git)
├── .env.production         # Ejemplo para producción (NO subir a git)
├── server.js               # Servidor Express principal
├── package.json
└── routes/
    ├── stripe.js           # Rutas de pago con Stripe
    └── email.js            # Rutas de envío de emails
```

## Instalación

```bash
cd backend
npm install
```

## Ejecución

```bash
# Desarrollo
npm start

# Producción (lee .env.production si existe, o usa variables de entorno del sistema)
NODE_ENV=production npm start
```

## Seguridad

⚠️ **NUNCA** commits archivos `.env` al repositorio.  
⚠️ Usa claves de Stripe **test** (`sk_test_`, `pk_test_`) en desarrollo.  
⚠️ Usa claves de Stripe **live** (`sk_live_`, `pk_live_`) solo en producción.  
⚠️ Rota las claves si sospechas que han sido comprometidas.

## CORS

El backend está configurado para aceptar peticiones desde:
- Desarrollo: `http://localhost:4200`
- Producción: `https://enbelendejuda.com`

Esto se controla con la variable `FRONTEND_URL`.
