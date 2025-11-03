# ☁️ PRODUCCIÓN - Variables para Vercel

**IMPORTANTE:** Estas variables se configuran en el Dashboard de Vercel, NO en un archivo.

📖 **Guía completa:** [docs/production/vercel.md](../docs/production/vercel.md)

---

## 📍 Dónde Configurar

Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

---

## 📝 Variables Requeridas

### 💳 Stripe (MODO LIVE)

```
STRIPE_WEBHOOK_SECRET
Valor: whsec_XXXX (obtener de https://dashboard.stripe.com/webhooks)
Environment: Production
```

### 🌐 URLs

```
FRONTEND_URL
Valor: https://enbelendejuda.com
Environment: Production
```

```
SUCCESS_URL
Valor: https://enbelendejuda.com/confirmacion
Environment: Production
```

```
CANCEL_URL
Valor: https://enbelendejuda.com
Environment: Production
```

### 📧 Email

```
EMAIL_HOST
Valor: smtp.gmail.com
Environment: Production
```

```
EMAIL_PORT
Valor: 587
Environment: Production
```

```
EMAIL_USER
Valor: tu-email@gmail.com
Environment: Production
```

```
EMAIL_PASS
Valor: xxxx xxxx xxxx xxxx (Gmail App Password)
Environment: Production
```

### ⚙️ Servidor

```
PORT
Valor: 3000
Environment: Production
```

```
NODE_ENV
Valor: production
Environment: Production
```

---

## ✅ Checklist

- [ ] 11 variables configuradas en Vercel
- [ ] Todas con Environment: "Production"
- [ ] Webhook de Stripe creado y secret configurado
- [ ] Gmail App Password generado y configurado
- [ ] Redeploy realizado después de añadir variables

---

## 🔗 Enlaces Útiles

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)

---

**NO crear archivo .env.production en el proyecto**  
**Todas las variables van en el Dashboard de Vercel**
