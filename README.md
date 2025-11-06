# 🎭 En Belén de Judá - Musical Website# 🎭 En Belén de Judá - Musical Website



[![Angular](https://img.shields.io/badge/Angular-20.2-red)](https://angular.io/)[![Angular](https://img.shields.io/badge/Angular-20.2-red)](https://angular.io/)

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

[![Stripe](https://img.shields.io/badge/Stripe-Payments-blue)](https://stripe.com/)[![Stripe](https://img.shields.io/badge/Stripe-Payments-blue)](https://stripe.com/)

[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)



Sistema profesional de venta de entradas online para el musical navideño "En Belén de Judá".Sistema profesional de venta de entradas online para el musical navideño "En Belén de Judá".



## 📋 Tabla de Contenidos## 📋 Tabla de Contenidos



- [🚀 Quick Start](#-quick-start)- [🚀 Quick Start](#-quick-start)

- [✨ Características](#-características)- [✨ Características](#-características)

- [🛠️ Tecnologías](#️-tecnologías)- [🛠️ Tecnologías](#️-tecnologías)

- [📁 Estructura del Proyecto](#-estructura-del-proyecto)- [📁 Estructura del Proyecto](#-estructura-del-proyecto)

- [⚙️ Configuración](#️-configuración)- [⚙️ Configuración](#️-configuración)

- [🚢 Despliegue](#-despliegue)- [🚢 Despliegue](#-despliegue)



------



## 🚀 Quick Start## 🚀 Quick Start



### Desarrollo Local### Desarrollo Local



```bash```bash

# 1. Instalar dependencias# 1. Instalar dependencias

npm installnpm install

cd backend && npm install && cd ..cd backend && npm install && cd ..



# 2. Configurar variables de entorno# 2. Configurar variables de entorno

cp backend/.env.example backend/.envcp backend/.env.example backend/.env

# Editar backend/.env con tus claves# Editar backend/.env con tus claves



# 3. Iniciar frontend# 3. Iniciar frontend

npm startnpm start



# 4. Iniciar backend (en otra terminal)# 4. Iniciar backend (en otra terminal)

cd backend && npm run devcd backend && npm run dev

``````



### Producción### Producción



🌐 **Sitio en producción**: [enbelendejuda.com](https://enbelendejuda.com)🌐 **Sitio en producción**: [enbelendejuda.com](https://enbelendejuda.com)



Ver **[Guía de Producción](backend/PRODUCTION-ENV.md)** para despliegue en Vercel.Ver **[Guía de Producción](backend/PRODUCTION-ENV.md)** para despliegue en Vercel.



------



## ✨ Características## ✨ Características



### Frontend (Angular)### Frontend (Angular)

- ✅ Diseño responsive adaptado a móviles, tablets y escritorio- ✅ Diseño responsive adaptado a móviles, tablets y escritorio

- ✅ Carrusel automático de imágenes del musical- ✅ Carrusel automático de imágenes del musical

- ✅ Sistema de reservas con selección de sesiones- ✅ Sistema de reservas con selección de sesiones

- ✅ Integración con Stripe para pagos seguros- ✅ Integración con Stripe para pagos seguros

- ✅ Desglose de IVA (10% cultural) en todas las compras- ✅ Desglose de IVA (10% cultural) en todas las compras

- ✅ Banner de cookies con consentimiento GDPR- ✅ Banner de cookies con consentimiento GDPR

- ✅ Páginas legales completas (Privacidad, Términos, Cookies)- ✅ Páginas legales completas (Privacidad, Términos, Cookies)

- ✅ Footer con redes sociales (Instagram, TikTok, YouTube)- ✅ Footer con redes sociales (Instagram, TikTok, YouTube)

- ✅ Validación de entradas con escáner QR- ✅ Validación de entradas con escáner QR



### Backend (Node.js + Express)### Backend (Node.js + Express)

- ✅ API REST con documentación completa- ✅ API REST con documentación completa

- ✅ Procesamiento de pagos vía Stripe Checkout- ✅ Procesamiento de pagos vía Stripe Checkout

- ✅ Webhooks de Stripe para confirmaciones automáticas- ✅ Webhooks de Stripe para confirmaciones automáticas

- ✅ Sistema de entradas disponibles con control de aforo- ✅ Sistema de entradas disponibles con control de aforo

- ✅ Envío de emails con Nodemailer- ✅ Envío de emails con Nodemailer

- ✅ Generación de tickets PDF con QR code- ✅ Generación de tickets PDF con QR code

- ✅ Seguridad: Helmet, CORS, Rate Limiting- ✅ Seguridad: Helmet, CORS, Rate Limiting

- ✅ Almacenamiento en MongoDB Atlas- ✅ Almacenamiento en MongoDB Atlas

- ✅ Logging detallado para debugging- ✅ Logging detallado para debugging



------



## 🛠️ Tecnologías## 🛠️ Tecnologías



### Frontend### Frontend

- **Angular 20+** - Framework principal- **Angular 20+** - Framework principal

- **TypeScript** - Lenguaje de programación- **TypeScript** - Lenguaje de programación

- **Angular Material** - Componentes UI- **Angular Material** - Componentes UI

- **Lucide Icons** - Iconografía moderna- **Lucide Icons** - Iconografía moderna

- **SCSS** - Estilos avanzados- **SCSS** - Estilos avanzados



### Backend### Backend

- **Node.js 18+** - Runtime de JavaScript- **Node.js 18+** - Runtime de JavaScript

- **Express.js** - Framework web- **Express.js** - Framework web

- **MongoDB** - Base de datos NoSQL

- **Stripe** - Procesamiento de pagos├── src/                    # Frontend Angular- **Stripe API** - Procesamiento de pagos

- **Nodemailer** - Envío de emails

- **PDFKit** - Generación de tickets PDF│   ├── app/components/    # Componentes UI- **Nodemailer** - Envío de emails

- **QRCode** - Generación de códigos QR

- **Helmet** - Seguridad HTTP headers│   ├── app/services/      # Servicios (Stripe, Logger)- **PDFKit** - Generación de PDFs

- **CORS** - Control de acceso cross-origin

- **express-rate-limit** - Limitación de peticiones│   └── environments/      # Configuración dev/prod- **QRCode** - Códigos QR para tickets



### Despliegue│

- **Vercel** - Hosting y serverless functions

- **MongoDB Atlas** - Base de datos en la nube├── backend/               # Backend Node.js### Seguridad



---│   ├── routes/           # API endpoints- **Helmet** - Protección de headers HTTP



## 📁 Estructura del Proyecto│   ├── data/            # Sesiones y datos- **CORS** - Control de acceso cross-origin



```│   └── server.js        # Servidor Express- **express-rate-limit** - Limitación de peticiones

Musical2025/

├── src/                          # 🎨 Frontend Angular│- **dotenv** - Gestión segura de variables de entorno

│   ├── app/

│   │   ├── components/          # Componentes UI└── docs/                  # Documentación

│   │   │   ├── home/           # Página principal con reservas

│   │   │   ├── confirmacion/   # Confirmación post-pago    ├── development/      # Guías de desarrollo## 📁 Estructura del Proyecto

│   │   │   ├── validar-entradas/ # Escáner QR para validación

│   │   │   ├── footer/         # Pie de página    └── production/       # Guías de producción

│   │   │   ├── cookie-consent/ # Banner de cookies

│   │   │   ├── politica-privacidad/``````

│   │   │   ├── politica-cookies/

│   │   │   └── terminos-condiciones/Musical2025/

│   │   ├── services/           # Servicios Angular

│   │   │   ├── stripe.service.ts---├── src/                          # Frontend Angular

│   │   │   └── logger.service.ts

│   │   └── utils/              # Utilidades│   ├── app/

│   │       └── precio.utils.ts

│   ├── assets/images/          # Imágenes y logos## 📚 Documentación│   │   ├── components/          # Componentes de la aplicación

│   └── environments/           # Configuración por entorno

││   │   │   ├── home/           # Página principal con reservas

├── backend/                    # ⚙️ Backend Node.js + Express

│   ├── config/### Desarrollo│   │   │   ├── confirmacion/   # Confirmación post-pago

│   │   └── database.js        # Configuración MongoDB

│   ├── models/- 📖 [Configuración Local](docs/development/setup.md)│   │   │   ├── footer/         # Pie de página

│   │   └── transaccion.model.js

│   ├── routes/- 🧪 [Testing con Stripe](docs/development/testing.md)│   │   │   ├── cookie-consent/ # Banner de cookies

│   │   ├── stripe.js          # Endpoints de Stripe

│   │   ├── email.js           # Envío de emails y PDFs│   │   │   ├── politica-privacidad/  # Página legal

│   │   └── validacion.js      # Validación de tickets

│   ├── services/### Producción│   │   │   ├── terminos-condiciones/ # Página legal

│   │   └── database.service.js

│   ├── utils/- 🚀 [Setup de Producción](docs/production/setup.md)│   │   │   └── politica-cookies/     # Página legal

│   │   └── precio.utils.js

│   ├── .env.example           # Plantilla de variables- ☁️ [Configuración Vercel](docs/production/vercel.md)│   │   ├── services/           # Servicios Angular

│   ├── server.js              # Servidor Express

│   └── PRODUCTION-ENV.md      # Guía de producción- 📋 [Checklist de Deploy](docs/production/deploy-checklist.md)│   │   │   ├── stripe.service.ts    # Integración Stripe

│

├── api/                        # 🚀 Serverless para Vercel│   │   │   └── logger.service.ts    # Sistema de logs

│   └── index.js               # Entry point serverless

│### Backend│   │   └── utils/              # Utilidades

├── angular.json

├── package.json- 📡 [API Documentation](backend/README.md)│   │       └── precio.utils.ts # Cálculos de IVA

├── tsconfig.json

├── vercel.json                # Configuración de Vercel- 🗄️ [Gestión de Datos](backend/data/README.md)│   ├── assets/                 # Recursos estáticos

└── README.md

```│   │   └── images/



------│   │       ├── logos/         # Logos e iconos



## ⚙️ Configuración│   │       └── *.jpg          # Imágenes del carrusel



### Variables de Entorno (Backend)## 🎯 Sesiones del Musical│   └── environments/          # Configuración por entorno



Crear `backend/.env` con:│



```env**Diciembre 2025:**├── backend/                    # Backend Node.js

# MongoDB

MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/- **Viernes 12** - 19:00h - Teatro Salesianos Deusto (Bilbao)│   ├── routes/



# Stripe- **Domingo 21** - 17:00h - Teatro Salesianos Deusto (Bilbao)│   │   ├── stripe.js          # Endpoints de Stripe

STRIPE_SECRET_KEY=sk_test_...

STRIPE_WEBHOOK_SECRET=whsec_...│   │   └── email.js           # Envío de emails y PDFs

STRIPE_PRICE_ADULT_ID=price_...

STRIPE_PRICE_CHILD_ID=price_...**Precios:** Adultos 6€ | Niños 3€ (IVA incluido)  │   ├── utils/



# Email (SMTP)**Capacidad:** 550 plazas/sesión│   │   └── precio.utils.js    # Cálculos de IVA (backend)

EMAIL_HOST=smtp.gmail.com

EMAIL_PORT=587│   ├── .env.example           # Plantilla de variables de entorno

EMAIL_USER=tu-email@gmail.com

EMAIL_PASS=tu-app-password---│   ├── server.js              # Servidor Express



# Configuración│   ├── package.json

NODE_ENV=development

PORT=3000## 🛠️ Stack Tecnológico│   └── README.md              # Documentación del backend

FRONTEND_URL=http://localhost:4200

```│



### Stripe - Configuración de Productos**Frontend:** Angular 20, TypeScript, Angular Material, Stripe.js  ├── api/                        # Serverless para Vercel



1. **Crear productos en Stripe Dashboard**:**Backend:** Node.js, Express, Stripe SDK, Nodemailer, PDFKit  │   └── index.js               # Entry point serverless

   - Entrada Adulto: 6€ (IVA incluido)

   - Entrada Niño: 3€ (IVA incluido)**Deploy:** Vercel (Frontend + Backend Serverless)├── angular.json               # Configuración de Angular



2. **Configurar webhook** en `https://tu-dominio.com/api/stripe/webhook`├── package.json               # Dependencias del frontend



3. **Añadir metadatos** a los productos:---├── tsconfig.json              # Configuración de TypeScript

   ```json

   {├── vercel.json                # Configuración de Vercel

     "tipo": "adulto" | "niño",

     "iva_porcentaje": "10",## 🔐 Seguridad└── README.md                  # Este archivo

     "precio_sin_iva": "4.55" | "2.73"

   }

   ```

✅ Variables de entorno protegidas  ```

---

✅ Webhooks firmados (Stripe)  

## 🚢 Despliegue

✅ Rate limiting  ## 📦 Instalación

### Producción en Vercel

✅ CORS configurado  

1. **Conectar repositorio** a Vercel

2. **Configurar variables de entorno** en Vercel Dashboard✅ HTTPS obligatorio### Prerrequisitos

3. **Añadir dominio personalizado** (opcional)

4. **Configurar MongoDB Atlas**:

   - Añadir IP `0.0.0.0/0` en Network Access (para Vercel)

   - Verificar string de conexión---- **Node.js** 18+ ([Descargar](https://nodejs.org/))



### Comandos útiles- **npm** 8+ (incluido con Node.js)



```bash## 📊 Monitoreo- **Angular CLI** 18+ (`npm install -g @angular/cli`)

# Build de producción

npm run build



# Test local del build- **Pagos:** https://dashboard.stripe.com### 1. Clonar el repositorio

npx http-server dist/belen-juda-musical/browser

- **Logs:** Vercel Dashboard → Logs

# Deploy manual (si no está en auto-deploy)

vercel --prod- **Entradas:** `npm run check-entradas````bash

```

git clone https://github.com/Danelitos/Musical2025.git

---

---cd Musical2025

## 🎯 Sesiones del Musical

```

**Diciembre 2025:**

- **Viernes 12** - 19:00h - Teatro Salesianos Deusto (Bilbao)## 📜 Licencia

- **Domingo 21** - 17:00h - Teatro Salesianos Deusto (Bilbao)

### 2. Instalar dependencias

**Precios:** Adultos 6€ | Niños 3€ (IVA incluido)  

**Capacidad:** 550 plazas/sesiónCopyright © 2025 En Belén de Judá. Todos los derechos reservados.



---#### Frontend



## 🔐 Seguridad---```bash



- ✅ Variables de entorno protegidas (.env en .gitignore)npm install

- ✅ Webhooks firmados con Stripe signature

- ✅ Rate limiting en endpoints críticos**Hecho con ❤️ por el equipo de En Belén de Judá** 🎭✨```

- ✅ CORS configurado correctamente

- ✅ Helmet para headers de seguridad

- ✅ Validación de datos en backend#### Backend

- ✅ Sin logs de datos sensibles```bash

cd backend

---npm install

cd ..

## 📊 Monitoreo```



- **Vercel Analytics** - Métricas de rendimiento## ⚙️ Configuración

- **Stripe Dashboard** - Transacciones y pagos

- **MongoDB Atlas** - Estado de la base de datos### Frontend (Angular)

- **Logs de Vercel** - Debugging en producción

Edita `src/environments/environment.ts`:

---

```typescript

## 🐛 Debuggingexport const environment = {

  production: false,

### Problemas comunes  stripePublicKey: 'pk_test_tu_clave_publica_aqui',

  apiUrl: 'http://localhost:3000/api'

**Error de conexión MongoDB:**};

```bash```

# Verificar IP en MongoDB Atlas Network Access

# Debe incluir 0.0.0.0/0 para Vercel### Backend (Node.js)

```

1. Crea el archivo `.env` en la carpeta `backend/`:

**Webhook no funciona:**

```bash```bash

# Verificar STRIPE_WEBHOOK_SECRETcd backend

# Comprobar URL del webhook en Stripe Dashboardcp .env.example .env

``````



**Email no se envía:**2. Edita `backend/.env` con tus valores reales:

```bash

# Verificar credenciales SMTP```env

# Gmail requiere "App Password", no la contraseña normalSTRIPE_SECRET_KEY=sk_test_tu_clave_secreta

```STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

EMAIL_USER=tu-email@gmail.com

---EMAIL_PASS=tu-app-password

```

## 📝 Licencia

Ver `backend/README.md` para instrucciones detalladas.

© 2025 En Belén de Judá - Todos los derechos reservados

## 🚀 Ejecución

---

### Desarrollo

## 👥 Contacto

#### Terminal 1 - Frontend

- 📧 Email: [Configurar en variables de entorno]```bash

- 📱 Instagram: [@enbelendejuda_](https://instagram.com/enbelendejuda_)npm start

- 🎵 TikTok: [@enbelendejuda](https://tiktok.com/@enbelendejuda)# o

- 📺 YouTube: [En Belén de Judá](https://youtube.com/@enbelendejuda)ng serve

```

---Frontend disponible en: http://localhost:4200



**Hecho con ❤️ para el musical navideño "En Belén de Judá"**#### Terminal 2 - Backend

```bash
cd backend
npm start
```
Backend disponible en: http://localhost:3000

#### Terminal 3 - Webhooks de Stripe (Opcional pero recomendado)
```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

### Producción

Ver la sección [Despliegue](#despliegue) más abajo.

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests (si aplica)
cd backend
npm test
```

## 🌐 Despliegue

### Vercel (Recomendado)

El proyecto está optimizado para Vercel:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Variables de entorno en Vercel:**

Ve a tu proyecto → Settings → Environment Variables y añade:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `FRONTEND_URL`
- `SUCCESS_URL`
- `CANCEL_URL`

**Configurar webhook en Stripe:**

1. Ve a [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Añade endpoint: `https://tu-dominio.vercel.app/api/stripe/webhook`
3. Selecciona eventos: `checkout.session.completed`, `checkout.session.expired`
4. Copia el signing secret a las variables de entorno de Vercel

### Otras opciones

El backend es compatible con:
- Azure App Service
- AWS Lambda
- Google Cloud Run
- Railway
- Render

## 📚 Documentación Adicional

- **Backend**: Ver [`backend/README.md`](backend/README.md)
- **Configuración de Stripe**: Ver guía en backend/README.md
- **Variables de entorno**: Ver [`backend/.env.example`](backend/.env.example)

## 🎯 Flujo de Compra

1. **Usuario selecciona sesión** → Elige número de entradas (adultos/niños)
2. **Completa formulario** → Nombre, email, acepta términos
3. **Click en "Comprar"** → Backend verifica disponibilidad
4. **Redirige a Stripe** → Usuario paga de forma segura
5. **Pago exitoso** → Stripe notifica vía webhook
6. **Backend procesa** → Descuenta entradas + Genera PDF + Envía email
7. **Usuario recibe confirmación** → Email con tickets PDF adjuntos

## 💰 Sistema de IVA

Todas las entradas incluyen IVA del **10%** (IVA reducido para espectáculos culturales):

- Entrada adulto: **6€** (incluye 0,55€ de IVA)
- Entrada niño: **3€** (incluye 0,27€ de IVA)

El desglose se muestra en:
- ✅ Resumen de compra (frontend)
- ✅ Ticket PDF
- ✅ Email de confirmación

## 🔐 Seguridad

### Frontend
- Validación de formularios en tiempo real
- Sanitización de inputs
- Protección XSS
- HTTPS en producción

### Backend
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Solo permite requests del frontend autorizado
- **Rate Limiting**: 100 requests/15min por IP
- **Webhook Signature**: Verifica que eventos vienen de Stripe
- **Variables de entorno**: Datos sensibles nunca en el código

## 🐛 Solución de Problemas

### El favicon no aparece
```bash
# Copiar favicon a la ubicación correcta
cp src/assets/images/logos/enbelendejuda_logo_negro-02.ico src/favicon.ico
```

### Las entradas no se descuentan
- Verifica que el webhook de Stripe esté configurado
- Revisa los logs del backend al completar un pago
- En desarrollo, usa `stripe listen`

### Email no se envía
- Verifica EMAIL_USER y EMAIL_PASS en .env
- Si usas Gmail, genera una App Password
- Revisa los logs del backend

### Error de CORS
- Verifica que FRONTEND_URL en backend/.env coincida con tu URL del frontend

## 📞 Contacto y Soporte

Para más información sobre el musical:
- Instagram: [@enbelendejuda](https://instagram.com/enbelendejuda)
- TikTok: [@enbelendejuda](https://tiktok.com/@enbelendejuda)
- YouTube: [En Belén de Judá](https://www.youtube.com/@EnBelénDeJudá)

## � Licencia

Proyecto privado - Musical "En Belén de Judá" © 2025

## 🙏 Agradecimientos

Desarrollado con ❤️ para el musical "En Belén de Judá"

---

**¿Necesitas ayuda?** Revisa la documentación en `backend/README.md` o abre un issue en GitHub.
│   │   ├── footer/             # Footer del sitio
│   │   └── confirmacion/       # Página de confirmación
│   ├── services/
│   │   ├── stripe.ts          # Servicio de Stripe
│   │   └── email.ts           # Servicio de emails
│   ├── environments/          # Configuraciones de entorno
│   └── app.routes.ts         # Configuración de rutas
├── assets/
│   └── images/               # Imágenes del sitio
└── styles.scss              # Estilos globales
```

## 🔧 Funcionalidades Técnicas

### Servicios Implementados

#### StripeService
- Inicialización de Stripe
- Creación de sesiones de checkout
- Manejo de pagos exitosos
- Gestión de errores

#### EmailService
- Templates HTML profesionales
- Envío de confirmaciones
- Datos de reserva detallados

## 🔐 Backend de Producción (Requerido)

Para producción, necesitarás un backend que maneje:

### Endpoints Necesarios
```
POST /api/create-checkout-session
GET  /api/checkout-session/:sessionId
POST /api/send-confirmation-email
```

---

**Desarrollado con ❤️ para llevar la magia de la Navidad a cada hogar**

🎭 **En Belén de Judá** - Donde la fe cobra vida en el escenario

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
