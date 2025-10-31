# ✅ Checklist de Despliegue a Producción - Musical En Belén de Judá

## 🔐 1. Configuración de Stripe

### Claves de API
- [ ] **Obtener claves de producción de Stripe**
  - Ir a: https://dashboard.stripe.com/apikeys
  - Copiar la clave **Publishable key** (empieza con `pk_live_`)
  - Copiar la clave **Secret key** (empieza con `sk_live_`)
  - ⚠️ **NUNCA compartas estas claves ni las subas a Git**

### Configurar Frontend
- [ ] Actualizar `src/environments/environment.prod.ts`
  ```typescript
  stripePublishableKey: 'pk_live_TU_CLAVE_AQUI'
  ```

### Configurar Backend
- [ ] Actualizar archivo `.env` en el servidor de producción:
  ```bash
  STRIPE_SECRET_KEY=sk_live_TU_CLAVE_AQUI
  ```

### Webhooks de Stripe
- [ ] **Configurar webhook en producción**
  1. Ir a: https://dashboard.stripe.com/webhooks
  2. Crear nuevo endpoint apuntando a: `https://tudominio.com/api/stripe/webhook`
  3. Seleccionar eventos:
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `checkout.session.async_payment_failed`
  4. Copiar el **Signing secret** (empieza con `whsec_`)
  5. Añadir a `.env`:
     ```bash
     STRIPE_WEBHOOK_SECRET=whsec_TU_SECRET_AQUI
     ```

## 📧 2. Configuración de Email

- [ ] Verificar que las credenciales de email estén configuradas en `.env`:
  ```bash
  EMAIL_USER=tu_email@gmail.com
  EMAIL_PASS=tu_contraseña_de_aplicacion
  ```
- [ ] Probar envío de emails de confirmación

## 🌐 3. Variables de Entorno del Backend

Verificar que el archivo `.env` en producción tenga todas estas variables:

```bash
# Servidor
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://enbelendejuda.com

# Stripe
STRIPE_SECRET_KEY=sk_live_XXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXX

# URLs de redirección
SUCCESS_URL=https://enbelendejuda.com/confirmacion
CANCEL_URL=https://enbelendejuda.com

# Email
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña
```

## 🧪 4. Pruebas Antes de Producción

### Pruebas de Stripe en Modo Test
- [ ] Comprar entradas con tarjeta de prueba: `4242 4242 4242 4242`
- [ ] Verificar que llegue el email de confirmación
- [ ] Verificar que se descuenten las entradas disponibles
- [ ] Probar sesión expirada (esperar 30 minutos sin pagar)
- [ ] Probar pago fallido con tarjeta: `4000 0000 0000 9995`

### Pruebas de Validación
- [ ] Intentar comprar más entradas de las disponibles
- [ ] Intentar comprar con email inválido
- [ ] Probar con conexión lenta/intermitente
- [ ] Verificar que los reintentos funcionen correctamente

## 🚀 5. Despliegue

### Frontend (Angular)
- [ ] Build de producción:
  ```bash
  npm run build
  ```
- [ ] Verificar que `environment.prod.ts` tenga las claves correctas
- [ ] Desplegar a Vercel/Netlify/tu hosting

### Backend (Node.js)
- [ ] Instalar dependencias:
  ```bash
  cd backend
  npm install
  ```
- [ ] Configurar `.env` con valores de producción
- [ ] Iniciar servidor:
  ```bash
  npm start
  ```
- [ ] Verificar que el servidor inicie sin errores de variables de entorno

## 🔍 6. Monitoreo Post-Despliegue

### Logs Críticos a Monitorear
- [ ] Errores de webhook (`❌ [WEBHOOK]`)
- [ ] Errores de autenticación de Stripe (`🚨 ERROR DE AUTENTICACIÓN`)
- [ ] Problemas con entradas agotadas
- [ ] Fallos en envío de emails

### Prueba en Producción (Modo Live)
- [ ] Hacer una compra real de prueba (puedes reembolsar después)
- [ ] Verificar que el webhook se active correctamente
- [ ] Verificar que llegue el email de confirmación
- [ ] Verificar el dashboard de Stripe para ver la transacción

## ⚠️ 7. Problemas Comunes y Soluciones

### Webhook no se activa
- Verificar que la URL del webhook sea correcta
- Verificar que el `STRIPE_WEBHOOK_SECRET` esté configurado
- Revisar logs del servidor para errores de firma

### Email no llega
- Verificar credenciales en `.env`
- Verificar que Gmail permita aplicaciones menos seguras
- Revisar carpeta de spam

### Entradas no se descargan
- Verificar que el webhook de `checkout.session.completed` se ejecute
- Revisar logs del servidor

### Errores de CORS
- Verificar que `FRONTEND_URL` en `.env` sea correcto
- Verificar configuración de CORS en `server.js`

## 📊 8. Mejoras Futuras Recomendadas

- [ ] **Base de datos**: Migrar de array en memoria a PostgreSQL/MongoDB para persistencia
- [ ] **Generación de PDFs**: Añadir generación de tickets en PDF con QR
- [ ] **Sistema de reembolsos**: Implementar lógica de reembolsos automáticos
- [ ] **Panel de administración**: Dashboard para ver ventas y disponibilidad
- [ ] **Monitoreo**: Integrar con Sentry o similar para tracking de errores
- [ ] **Analytics**: Integrar Google Analytics o similar

## 🎯 Casos de Pago Manejados

✅ **Casos cubiertos actualmente:**

1. **Pago exitoso** → Email enviado + entradas descontadas
2. **Pago fallido** → Entradas devueltas + usuario notificado
3. **Sesión expirada** → Entradas devueltas automáticamente
4. **Entradas agotadas** → Usuario notificado antes de crear sesión
5. **Race conditions** → Reserva temporal previene sobreventa
6. **Errores de red** → Reintentos automáticos (3 intentos)
7. **Timeout** → Usuario notificado después de 15 segundos
8. **Email inválido** → Validación antes de crear sesión
9. **Sesión pasada** → Validación de fecha antes de procesar
10. **Errores de Stripe API** → Manejo específico por tipo de error

## 📝 Notas Importantes

- Las sesiones de Stripe expiran en **30 minutos**
- Las reservas temporales se limpian automáticamente cada **10 minutos**
- El sistema permite máximo **10 entradas por compra**
- Los webhooks de Stripe pueden tener un pequeño retraso (normalmente < 1 segundo)
- En producción, considera migrar a una base de datos para mayor robustez

---

**¿Todo listo?** ¡Es hora de lanzar! 🚀

Si encuentras algún problema, revisa los logs del servidor y del navegador para más información.
