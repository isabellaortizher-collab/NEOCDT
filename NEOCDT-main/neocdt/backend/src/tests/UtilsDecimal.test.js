const { toDecimal128 } = require('../Utils/Decimal');
const mongoose = require('mongoose');

describe('toDecimal128', () => {
  test('devuelve null para entrada null', () => {
    expect(toDecimal128(null)).toBeNull();
  });

  test('devuelve null para entrada indefinida', () => {
    expect(toDecimal128(undefined)).toBeNull();
  });

  test('convierte cadena numérica a Decimal128', () => {
    const d = toDecimal128('1.23');
    expect(d).toEqual(mongoose.Types.Decimal128.fromString('1.23'));
  });

  test('convierte número a Decimal128', () => {
    const d = toDecimal128(123);
    expect(d).toEqual(mongoose.Types.Decimal128.fromString('123'));
  });

  test('convierte cero a Decimal128', () => {
    const d = toDecimal128(0);
    expect(d).toEqual(mongoose.Types.Decimal128.fromString('0'));
  });

  test('convierte número negativo a Decimal128', () => {
    const d = toDecimal128(-1.5);
    expect(d).toEqual(mongoose.Types.Decimal128.fromString('-1.5'));
  });

  test('lanza error para booleano true', () => {
    expect(() => toDecimal128(true)).toThrow();
  });

  test('lanza error para booleano false', () => {
    expect(() => toDecimal128(false)).toThrow();
  });

  test('lanza error para cadena vacía', () => {
    expect(() => toDecimal128('')).toThrow();
  });

  test('lanza error para objeto', () => {
    expect(() => toDecimal128({ a: 1 })).toThrow();
  });

  test('lanza error para arreglo', () => {
    expect(() => toDecimal128([1, 2])).toThrow();
  });

  test('convierte notación científica a Decimal128', () => {
    const d = toDecimal128('1e10');
    expect(d).toEqual(mongoose.Types.Decimal128.fromString('1e10'));
  });

  test('lanza error para cadena numérica inválida', () => {
    expect(() => toDecimal128('abc')).toThrow();
  });
});
