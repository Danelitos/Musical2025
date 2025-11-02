const fs = require('fs');
const path = require('path');

/**
 * Script para mostrar el estado actual de las entradas vendidas
 * Ejecutar antes de hacer deploy para actualizar sesiones.json
 */

const sesionesPath = path.join(__dirname, 'data', 'sesiones.json');

console.log('\n📊 ESTADO ACTUAL DE ENTRADAS - Musical "En Belén de Judá"\n');
console.log('='.repeat(70));

try {
  const sesionesData = fs.readFileSync(sesionesPath, 'utf8');
  const sesiones = JSON.parse(sesionesData);

  const ENTRADAS_TOTALES = 550;

  sesiones.forEach((sesion, index) => {
    const vendidas = ENTRADAS_TOTALES - sesion.entradasDisponibles;
    const porcentaje = ((vendidas / ENTRADAS_TOTALES) * 100).toFixed(1);
    
    console.log(`\n📅 SESIÓN ${index + 1}: ${sesion.fecha} a las ${sesion.hora}`);
    console.log(`   Lugar: ${sesion.lugar}`);
    console.log(`   ✅ Entradas disponibles: ${sesion.entradasDisponibles}`);
    console.log(`   🎫 Entradas vendidas: ${vendidas} (${porcentaje}%)`);
    console.log(`   💰 Ingresos estimados: ${vendidas * ((sesion.precioAdulto + sesion.precioNino) / 2)}€`);
  });

  const totalDisponibles = sesiones.reduce((sum, s) => sum + s.entradasDisponibles, 0);
  const totalVendidas = (ENTRADAS_TOTALES * sesiones.length) - totalDisponibles;
  const totalPorcentaje = ((totalVendidas / (ENTRADAS_TOTALES * sesiones.length)) * 100).toFixed(1);

  console.log('\n' + '='.repeat(70));
  console.log('\n📈 RESUMEN TOTAL');
  console.log(`   Total disponibles: ${totalDisponibles}`);
  console.log(`   Total vendidas: ${totalVendidas} (${totalPorcentaje}%)`);
  console.log(`   Capacidad total: ${ENTRADAS_TOTALES * sesiones.length}`);

  console.log('\n' + '='.repeat(70));
  console.log('\n⚠️  IMPORTANTE ANTES DE HACER DEPLOY:');
  console.log('   1. Revisa los números arriba');
  console.log('   2. Si son correctos, haz commit de backend/data/sesiones.json');
  console.log('   3. Luego haz push para desplegar');
  console.log('\n   ⚠️  Si NO haces commit de sesiones.json, se resetearán a 550!\n');

} catch (error) {
  console.error('❌ Error leyendo sesiones.json:', error.message);
  console.log('\n💡 Asegúrate de que existe backend/data/sesiones.json\n');
}
