# 🎭 En Belén de Judá - Musical Website

Un sitio web profesional y seguro para el musical navideño "En Belén de Judá", desarrollado con Angular y con integración de pagos a través de Stripe.

## ✨ Características Principales

### 🎨 Diseño y UX
- **Diseño cinematográfico** inspirado en El Rey León
- **Colores cálidos navideños** (dorados, rojos, cremas)
- **Totalmente responsive** (móvil, tablet, escritorio)
- **Animaciones suaves** y transiciones elegantes
- **Tipografías elegantes** con fuentes serif

### 🏗️ Arquitectura del Sitio

#### 1. **Header con Carrusel**
- Logo centrado del musical
- Carrusel automático de imágenes con transición suave
- Indicadores interactivos
- Call-to-action prominente

#### 2. **Sección de Reservas**
- Listado dinámico de sesiones
- Información de fecha, hora, lugar y disponibilidad
- Diseño de tarjetas con efectos hover
- Indicadores visuales de disponibilidad

#### 3. **Reproductor de Trailer**
- Video responsivo integrado de YouTube
- Diseño centrado y optimizado

#### 4. **Formulario de Compra Seguro**
- Validaciones robustas en tiempo real
- Integración con Stripe Checkout
- Resumen dinámico de la compra
- Mensajes de error claros y útiles

#### 5. **Página de Confirmación**
- Detalles completos de la reserva
- Diseño de confirmación profesional
- Opciones para descargar/compartir
- Estados de carga y error

#### 6. **Footer Completo**
- Enlaces a redes sociales
- Información de contacto
- Enlaces legales
- Decoración navideña sutil

### 🔒 Seguridad Implementada

- **HTTPS obligatorio** en producción
- **Variables de entorno** para claves sensibles
- **Validación frontend y backend**
- **Sanitización de inputs**
- **Protección XSS y CSRF**
- **Headers de seguridad**

### 💳 Integración de Pagos

- **Stripe Checkout** para pagos seguros
- **Redirección automática** tras pago exitoso
- **Manejo de errores** y estados de carga
- **Confirmación por email** automática

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- npm (v8 o superior)
- Angular CLI

### Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno**
```bash
# Editar .env con tus claves reales
# IMPORTANTE: Nunca subas el archivo .env al repositorio
```

3. **Configurar Stripe**
   - Crear cuenta en [Stripe](https://stripe.com)
   - Obtener claves de prueba (pk_test_... y sk_test_...)
   - Actualizar las claves en `.env` y `src/environments/`

4. **Agregar imágenes**
   - Logo: `src/assets/images/logo-belen-juda.png`
   - Carrusel: `src/assets/images/carousel1.jpg` a `carousel4.jpg`

### Desarrollo

```bash
# Servidor de desarrollo
npm start
# o
ng serve

# La aplicación estará disponible en http://localhost:4200
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── home/               # Página principal
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
