@echo off
echo 🎭 Instalando Backend del Musical "En Belén de Judá"
echo.

cd backend

echo 📦 Instalando dependencias de Node.js...
call npm install

echo.
echo ✅ Instalación completada!
echo.
echo 🔧 Próximos pasos:
echo 1. Edita el archivo .env con tus claves reales de Stripe
echo 2. Ejecuta "npm run dev" para iniciar el servidor
echo 3. El backend estará disponible en http://localhost:3000
echo.
echo 📚 Lee backend/README.md para más información
pause
