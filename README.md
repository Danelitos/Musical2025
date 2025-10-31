# 🎭 En Belén de Judá - Musical Website

Sistema de venta de entradas online para el musical navideño "En Belén de Judá".

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Despliegue](#despliegue)
- [Documentación Adicional](#documentación-adicional)

## ✨ Características

### Frontend (Angular)
- ✅ **Diseño responsive** adaptado a móviles, tablets y escritorio
- ✅ **Carrusel automático** de imágenes del musical
- ✅ **Sistema de reservas** con selección de sesiones
- ✅ **Integración con Stripe** para pagos seguros
- ✅ **Generación de tickets PDF** enviados por email
- ✅ **Desglose de IVA** (10% cultural) en todas las compras
- ✅ **Banner de cookies** con consentimiento GDPR
- ✅ **Páginas legales** completas (Privacidad, Términos, Cookies)
- ✅ **Footer con redes sociales** (Instagram, TikTok, YouTube)

### Backend (Node.js + Express)
- ✅ **API REST** con documentación completa
- ✅ **Procesamiento de pagos** vía Stripe Checkout
- ✅ **Webhooks de Stripe** para confirmaciones automáticas
- ✅ **Sistema de entradas disponibles** con descuento automático
- ✅ **Envío de emails** con Nodemailer
- ✅ **Generación de PDFs** con QR code para tickets
- ✅ **Seguridad**: Helmet, CORS, Rate Limiting
- ✅ **Logging detallado** para debugging

## 🛠️ Tecnologías

### Frontend
- **Angular 18+** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Angular Material** - Componentes UI
- **Lucide Icons** - Iconografía moderna
- **SCSS** - Estilos avanzados

### Backend
- **Node.js 18+** - Runtime de JavaScript
- **Express.js** - Framework web
- **Stripe API** - Procesamiento de pagos
- **Nodemailer** - Envío de emails
- **PDFKit** - Generación de PDFs
- **QRCode** - Códigos QR para tickets

### Seguridad
- **Helmet** - Protección de headers HTTP
- **CORS** - Control de acceso cross-origin
- **express-rate-limit** - Limitación de peticiones
- **dotenv** - Gestión segura de variables de entorno

## 📁 Estructura del Proyecto

```
Musical2025/
├── src/                          # Frontend Angular
│   ├── app/
│   │   ├── components/          # Componentes de la aplicación
│   │   │   ├── home/           # Página principal con reservas
│   │   │   ├── confirmacion/   # Confirmación post-pago
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
│   │   └── email.js           # Envío de emails y PDFs
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

## 📦 Instalación

### Prerrequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **npm** 8+ (incluido con Node.js)
- **Angular CLI** 18+ (`npm install -g @angular/cli`)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Danelitos/Musical2025.git
cd Musical2025
```

### 2. Instalar dependencias

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
cd ..
```

## ⚙️ Configuración

### Frontend (Angular)

Edita `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  stripePublicKey: 'pk_test_tu_clave_publica_aqui',
  apiUrl: 'http://localhost:3000/api'
};
```

### Backend (Node.js)

1. Crea el archivo `.env` en la carpeta `backend/`:

```bash
cd backend
cp .env.example .env
```

2. Edita `backend/.env` con tus valores reales:

```env
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
```

Ver `backend/README.md` para instrucciones detalladas.

## 🚀 Ejecución

### Desarrollo

#### Terminal 1 - Frontend
```bash
npm start
# o
ng serve
```
Frontend disponible en: http://localhost:4200

#### Terminal 2 - Backend
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

- Entrada adulto: **5€** (incluye 0.45€ de IVA)
- Entrada niño: **3€** (incluye 0.27€ de IVA)

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
