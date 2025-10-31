/**
 * Utilidades para cálculo de precios con IVA
 * Según la normativa española, los eventos culturales tienen un IVA del 10%
 */

export const IVA_PERCENTAGE = 10; // 10% IVA cultural

/**
 * Calcula el precio con IVA incluido a partir de la base imponible
 * @param basePrice - Precio sin IVA (base imponible)
 * @returns Precio con IVA incluido, redondeado a 2 decimales
 */
export function calcularPrecioConIVA(basePrice: number): number {
  return parseFloat((basePrice * (1 + IVA_PERCENTAGE / 100)).toFixed(2));
}

/**
 * Calcula la base imponible a partir del precio con IVA incluido
 * @param precioConIVA - Precio con IVA incluido
 * @returns Base imponible (precio sin IVA), redondeado a 2 decimales
 */
export function calcularBaseImponible(precioConIVA: number): number {
  return parseFloat((precioConIVA / (1 + IVA_PERCENTAGE / 100)).toFixed(2));
}

/**
 * Calcula el importe del IVA a partir del precio con IVA incluido
 * @param precioConIVA - Precio con IVA incluido
 * @returns Importe del IVA, redondeado a 2 decimales
 */
export function calcularImporteIVA(precioConIVA: number): number {
  const baseImponible = calcularBaseImponible(precioConIVA);
  return parseFloat((precioConIVA - baseImponible).toFixed(2));
}

/**
 * Desglosa un precio con IVA en sus componentes
 * @param precioConIVA - Precio con IVA incluido
 * @returns Objeto con base imponible, IVA y total
 */
export function desglosarPrecio(precioConIVA: number) {
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
 * Formatea un precio para mostrar en la UI
 * @param precio - Precio a formatear
 * @returns String formateado con el símbolo de euro
 */
export function formatearPrecio(precio: number): string {
  return `${precio.toFixed(2)}€`;
}

/**
 * Calcula el desglose de precios para múltiples entradas
 * @param precioUnitario - Precio unitario con IVA incluido
 * @param cantidad - Cantidad de entradas
 * @returns Desglose completo del precio total
 */
export function desglosarPrecioTotal(precioUnitario: number, cantidad: number) {
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
