const mongoose = require('mongoose');
const Decimal128 = mongoose.Types.Decimal128;

function toDecimal128(v) {
  if (v == null) return null;
  return Decimal128.fromString(String(v));
}

module.exports = { toDecimal128 };
