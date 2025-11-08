const mongoose = require('mongoose');
const Decimal128 = mongoose.Types.Decimal128;

/**
 * Convierte un valor a Decimal128 de MongoDB
 * @param {any} v - Valor a convertir
 * @returns {Decimal128|null} Valor convertido o null si es nulo
 */
function toDecimal128(v) {
  if (v == null) return null;
  return Decimal128.fromString(String(v));
}

module.exports = { toDecimal128 };
