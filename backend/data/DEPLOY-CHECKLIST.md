# 🚀 Guía Rápida: Deploy sin Perder Entradas

## ⚡ Antes de Cada Deploy

### Paso 1: Verificar Estado
```bash
cd backend
npm run check-entradas
```

### Paso 2: Hacer Commit si Hay Cambios
```bash
# Si el script muestra que hay entradas vendidas:
git add backend/data/sesiones.json
git commit -m "Update: Actualizar entradas vendidas"
```

### Paso 3: Deploy Normal
```bash
git push
```

---

## 📌 REGLA DE ORO

**Siempre ejecuta `npm run check-entradas` ANTES de hacer `git push`**

Si olvidas hacer commit de `sesiones.json`, las entradas se resetearán a 550.

---

## 🔍 ¿Qué Muestra el Script?

```
📊 ESTADO ACTUAL DE ENTRADAS

📅 SESIÓN 1: 2025-12-12 a las 19:00
   ✅ Entradas disponibles: 545    ← Si es menos de 550, HAY VENTAS
   🎫 Entradas vendidas: 5 (0.9%)

📅 SESIÓN 2: 2025-12-21 a las 17:00
   ✅ Entradas disponibles: 550
   🎫 Entradas vendidas: 0 (0.0%)
```

---

## ✅ Checklist Pre-Deploy

- [ ] Ejecutar `npm run check-entradas`
- [ ] Revisar si hay entradas vendidas
- [ ] Si hay ventas: `git add backend/data/sesiones.json`
- [ ] Hacer commit con mensaje descriptivo
- [ ] Hacer push

---

## 🆘 Recuperación de Emergencia

Si accidentalmente reseteas las entradas:

```bash
# Ver historial
git log backend/data/sesiones.json

# Restaurar versión anterior
git checkout HEAD~1 backend/data/sesiones.json

# Hacer commit
git add backend/data/sesiones.json
git commit -m "Restore: Recuperar estado de entradas"
git push
```
