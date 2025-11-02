# 📊 Sistema de Persistencia de Entradas

## ⚠️ **MUY IMPORTANTE**

Este archivo `sesiones.json` contiene el **estado real de las entradas vendidas**.

**SIEMPRE debes hacer commit de este archivo** después de que se vendan entradas, o se perderá el contador al hacer deploy.

---

## 🔄 Flujo de Trabajo

### **Antes de hacer Deploy:**

1. **Ejecuta el script de verificación:**
   ```bash
   cd backend
   node check-entradas.js
   ```

2. **Revisa el estado actual:**
   - El script te mostrará cuántas entradas se han vendido
   - Cuántas quedan disponibles
   - El porcentaje de ocupación

3. **Si hay cambios:**
   ```bash
   git add backend/data/sesiones.json
   git commit -m "Update: Actualizar estado de entradas vendidas"
   git push
   ```

4. **Si NO haces commit:**
   - ⚠️ Las entradas se resetearán a 550 en el próximo deploy
   - ❌ Se perderá el registro de ventas

---

## 📝 Ejemplo de Uso

```bash
# 1. Ver estado actual
cd backend
node check-entradas.js

# Salida:
# 📊 ESTADO ACTUAL DE ENTRADAS
# =====================================
# 
# 📅 SESIÓN 1: 2025-12-12 a las 19:00
#    ✅ Entradas disponibles: 545
#    🎫 Entradas vendidas: 5 (0.9%)
# 
# 📅 SESIÓN 2: 2025-12-21 a las 17:00
#    ✅ Entradas disponibles: 550
#    🎫 Entradas vendidas: 0 (0.0%)

# 2. Si ves cambios, hacer commit
git add backend/data/sesiones.json
git commit -m "Update: 5 entradas vendidas sesión 12/12"
git push
```

---

## 🔧 Cómo Funciona

1. **Al iniciar el servidor:**
   - Lee `sesiones.json` y carga el estado actual
   - Si no existe, usa valores por defecto (550 entradas)

2. **Cuando alguien compra:**
   - Se descuentan las entradas inmediatamente
   - Se guarda el nuevo estado en `sesiones.json`
   - El archivo se actualiza en el servidor

3. **En el siguiente deploy:**
   - Si hiciste commit del archivo: ✅ Mantiene el estado
   - Si NO hiciste commit: ❌ Se resetea a 550

---

## 🚨 Recordatorios

- ✅ **Hacer commit de sesiones.json después de ventas**
- ✅ Ejecutar `node check-entradas.js` antes de cada deploy
- ❌ NO editar manualmente sesiones.json (solo si sabes lo que haces)
- ❌ NO incluir sesiones.json en .gitignore

---

## 📞 ¿Problemas?

Si las entradas se han reseteado accidentalmente:
1. Revisa el historial de commits anterior
2. Restaura la versión correcta de `sesiones.json`
3. Haz commit y push

```bash
# Ver versiones anteriores
git log --oneline backend/data/sesiones.json

# Restaurar versión anterior
git checkout <commit-hash> backend/data/sesiones.json
git add backend/data/sesiones.json
git commit -m "Restore: Recuperar estado correcto de entradas"
git push
```
