const { toDecimal128 } = require('../src/Utils/Decimal');
test('toDecimal128 maneja valores nulos y válidos', () => {
  expect(toDecimal128(null)).toBeNull();
  expect(toDecimal128(undefined)).toBeNull();
  const d = toDecimal128('1.23');
  expect(d._bsontype).toBe('Decimal128');
});
