// tests/CDT.test.js

jest.mock('../Models/CDT', () => {
  const CDT = jest.fn(function (data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  });
  CDT.find = jest.fn();
  CDT.findById = jest.fn();
  return CDT;
});

jest.mock('../Models/ContenidoCDT', () => {
  const ContenidoCDT = jest.fn(function (data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  });
  ContenidoCDT.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue([])
  });
  return ContenidoCDT;
});

jest.mock('../Models/Usuario', () => {
  const Usuario = jest.fn(function (data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  });
  Usuario.findOne = jest.fn();
  return Usuario;
});



jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

// Mock de Date para aserciones deterministas de fecha
const mockDate = new Date('2023-01-01T00:00:00Z');
global.Date = jest.fn(() => mockDate);
Date.now = jest.fn(() => mockDate.getTime());

const CDT = require('../Models/CDT');
const Usuario = require('../Models/Usuario');

const cdtCtrl = require('../Controllers/CDTController');
const authMiddleware = require('../Middleware/AuthMiddleware');

beforeEach(() => {
  jest.clearAllMocks();
});

test('crear CDT exitosamente', async () => {
  const req = { body: { descripcion: 'Test CDT', contenido: { montoPrincipal: 1000, tasaInteres: 0.05, plazoMeses: 12 } }, user: { userId: 'user123' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await cdtCtrl.crearCDT(req, res);

  expect(CDT).toHaveBeenCalledWith({
    usuarioId: 'user123',
    descripcion: 'Test CDT',
    contenido: { montoPrincipal: 1000, tasaInteres: 0.05, plazoMeses: 12 }
  });
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    message: 'Solicitud de apertura de CDT exitosa',
    cdt: expect.any(Object)
  });
});

test('crear CDT falla por descripción faltante', async () => {
  const req = { body: { contenido: { montoPrincipal: 1000, tasaInteres: 0.05, plazoMeses: 12 } }, user: { userId: 'user123' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await cdtCtrl.crearCDT(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('descripcion requerida') }));
});

test('listar CDTs del usuario', async () => {
  const req = { usuarioId: 'user123' };
  const res = { json: jest.fn() };

  const mockCDTs = [{ _id: '1', monto: 1000 }, { _id: '2', monto: 2000 }];
  CDT.find.mockResolvedValue(mockCDTs);

  await cdtCtrl.listarCDTs(req, res);

  expect(CDT.find).toHaveBeenCalledWith({ usuarioId: 'user123' });
  expect(res.json).toHaveBeenCalledWith(mockCDTs);
});

test('renovar CDT exitosamente', async () => {
  const req = { params: { idCDT: 'cdt123' } };
  const res = { json: jest.fn() };

  const mockCDT = {
    usuarioId: 'user123',
    monto: 1000,
    fechaVencimiento: new Date('2023-03-01T00:00:00Z'),
    renovacionAutomatica: true,
    save: jest.fn().mockResolvedValue(true)
  };
  CDT.findById.mockResolvedValue(mockCDT);

  await cdtCtrl.renovarCDT(req, res);

  expect(CDT.findById).toHaveBeenCalledWith('cdt123');
  const expectedFechaVencimiento = new Date('2023-03-01T00:00:00Z');
  expectedFechaVencimiento.setDate(expectedFechaVencimiento.getDate() + 30);

  expect(CDT).toHaveBeenCalledWith({
    usuarioId: 'user123',
    monto: 1000,
    fechaVencimiento: expectedFechaVencimiento,
    renovacionAutomatica: true
  });
  expect(res.json).toHaveBeenCalledWith({
    message: 'CDT renovado automáticamente',
    cdt: expect.any(Object)
  });
});

test('renovar CDT inexistente', async () => {
  const req = { params: { idCDT: 'invalid' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  CDT.findById.mockResolvedValue(null);

  await cdtCtrl.renovarCDT(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "CDT no encontrado" });
});

test('middleware rechaza token inválido', async () => {
  const req = { headers: { authorization: 'Bearer invalid' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  await authMiddleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  expect(next).not.toHaveBeenCalled();
});

test('middleware acepta token válido', async () => {
  const req = { headers: { authorization: 'Bearer validtoken' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  // Mock jwt.verify to return a valid payload
  const jwt = require('jsonwebtoken');
  jwt.verify.mockReturnValue({ userId: 'user123', rol: 'Cliente' });

  await authMiddleware(req, res, next);

  expect(req.usuarioId).toBe('user123');
  expect(req.userRole).toBe('Cliente');
  expect(next).toHaveBeenCalled();
});

test('middleware rechaza sin header de autorización', async () => {
  const req = { headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  await authMiddleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
  expect(next).not.toHaveBeenCalled();
});

