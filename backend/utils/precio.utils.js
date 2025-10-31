/**
 * Utilidades para cálculo de precios con IVA
 * Según la normativa española, los eventos culturales tienen un IVA del 10%
 */

const IVA_PERCENTAGE = 10; // 10% IVA cultural

/**
 * Calcula el precio con IVA incluido a partir de la base imponible
 * @param {number} basePrice - Precio sin IVA (base imponible)
 * @returns {number} Precio con IVA incluido, redondeado a 2 decimales
 */
function calcularPrecioConIVA(basePrice) {
  return parseFloat((basePrice * (1 + IVA_PERCENTAGE / 100)).toFixed(2));
}

/**
 * Calcula la base imponible a partir del precio con IVA incluido
 * @param {number} precioConIVA - Precio con IVA incluido
 * @returns {number} Base imponible (precio sin IVA), redondeado a 2 decimales
 */
function calcularBaseImponible(precioConIVA) {
  return parseFloat((precioConIVA / (1 + IVA_PERCENTAGE / 100)).toFixed(2));
}

/**
 * Calcula el importe del IVA a partir del precio con IVA incluido
 * @param {number} precioConIVA - Precio con IVA incluido
 * @returns {number} Importe del IVA, redondeado a 2 decimales
 */
function calcularImporteIVA(precioConIVA) {
  const baseImponible = calcularBaseImponible(precioConIVA);
  return parseFloat((precioConIVA - baseImponible).toFixed(2));
}

/**
 * Desglosa un precio con IVA en sus componentes
 * @param {number} precioConIVA - Precio con IVA incluido
 * @returns {Object} Objeto con base imponible, IVA y total
 */
function desglosarPrecio(precioConIVA) {
  const baseImponible = calcularBaseImponible(precioConIVA);
  const importeIVA = calcularImporteIVA(precioConIVA);
  
  return {
    baseImponible,
    iva: importeIVA,
    total: precioConIVA,
    porcentajeIVA: IVA_PERCENTAGE
  };
}

/**
 * Calcula el desglose de precios para múltiples entradas
 * @param {number} precioUnitario - Precio unitario con IVA incluido
 * @param {number} cantidad - Cantidad de entradas
 * @returns {Object} Desglose completo del precio total
 */
function desglosarPrecioTotal(precioUnitario, cantidad) {
  const baseUnitaria = calcularBaseImponible(precioUnitario);
  const baseTotal = baseUnitaria * cantidad;
  const ivaTotal = (precioUnitario - baseUnitaria) * cantidad;
  const total = precioUnitario * cantidad;
  
  return {
    baseImponible: parseFloat(baseTotal.toFixed(2)),
    iva: parseFloat(ivaTotal.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    porcentajeIVA: IVA_PERCENTAGE,
    cantidad,
    precioUnitario
  };
}

module.exports = {
  IVA_PERCENTAGE,
  calcularPrecioConIVA,
  calcularBaseImponible,
  calcularImporteIVA,
  desglosarPrecio,
  desglosarPrecioTotal
};
