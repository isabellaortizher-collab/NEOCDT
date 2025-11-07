// tests/Auth.test.js

jest.mock('../Models/Usuario', () => {
  const Usuario = jest.fn(function (data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  });
  Usuario.findOne = jest.fn();
  return Usuario;
});

jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    readyState: 1,
    on: jest.fn(),
    once: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const Usuario = require('../Models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authCtrl = require('../Controllers/AuthController');
const authMiddleware = require('../Middleware/AuthMiddleware');

beforeEach(() => {
  jest.clearAllMocks();
});

test('registro y login exitoso', async () => {
  const user = { nombreUsuario: 't', nombreCompleto: 'T', correo: 't@test.com', contrasena: '12345' };

  Usuario.findOne.mockResolvedValue(null);
  bcrypt.genSalt.mockResolvedValue(10);
  bcrypt.hash.mockResolvedValue('hashedPassword');
  jwt.sign.mockReturnValue('token123');

  const reqReg = { body: user };
  const resReg = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await authCtrl.register(reqReg, resReg);
  expect(Usuario.findOne).toHaveBeenCalled();
  expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
  expect(bcrypt.hash).toHaveBeenCalledWith(user.contrasena, 10);
  expect(resReg.status).toHaveBeenCalledWith(201);

  Usuario.findOne.mockResolvedValue({ contrasena: 'hashedPassword', _id: '1', rol: 'user', save: jest.fn().mockResolvedValue(true) });
  bcrypt.compare.mockResolvedValue(true);
  jwt.sign.mockReturnValue('token123');

  const reqLog = { body: { correo: 't@test.com', contrasena: '12345' } };
  const resLog = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await authCtrl.login(reqLog, resLog);
  expect(Usuario.findOne).toHaveBeenCalled();
  expect(bcrypt.compare).toHaveBeenCalledWith('12345', 'hashedPassword');
  expect(resLog.status).toHaveBeenCalledWith(200);
  expect(resLog.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'token123' }));
});

test('registro falla por campos requeridos faltantes', async () => {
  const req = { body: { nombreUsuario: '', nombreCompleto: '', correo: '', contrasena: '' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  Usuario.findOne.mockResolvedValue(null);
  bcrypt.genSalt.mockRejectedValue(new Error('bcrypt error'));

  await authCtrl.register(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
});

test('login falla por usuario no encontrado', async () => {
  Usuario.findOne.mockResolvedValue(null);

  const req = { body: { correo: 'nonexistent@test.com', contrasena: '12345' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await authCtrl.login(req, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Credenciales inválidas') }));
});

test('rechaza registro duplicado por correo', async () => {
  const usuario = { nombreUsuario: 'dupUser', nombreCompleto: 'Dup User', correo: 'dup@test.com', contrasena: '12345' };

  Usuario.findOne.mockResolvedValue({ correo: 'dup@test.com' });

  const req = { body: usuario };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await authCtrl.register(req, res);
  expect(Usuario.findOne).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Usuario ya existe') }));
});

test('rechaza login con contraseña incorrecta', async () => {
  Usuario.findOne.mockResolvedValue({ contrasena: 'hashedPassword' });
  bcrypt.compare.mockResolvedValue(false);

  const req = { body: { correo: 'fail@test.com', contrasena: 'mala' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await authCtrl.login(req, res);
  expect(Usuario.findOne).toHaveBeenCalled();
  expect(bcrypt.compare).toHaveBeenCalledWith('mala', 'hashedPassword');
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Credenciales inválidas') }));
});

test('forzar error interno en login', async () => {
  Usuario.findOne.mockResolvedValue({ contrasena: 'hashed', _id: '1', rol: 'user', save: jest.fn().mockResolvedValue(true) });
  bcrypt.compare.mockResolvedValue(true);
  jwt.sign.mockImplementation(() => { throw new Error('jwt error'); });

  const req = { body: { correo: 'x@test', contrasena: '123' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await authCtrl.login(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
});

test('rechaza token inválido (AuthMiddleware)', async () => {
  jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

  const req = { headers: { authorization: 'Bearer token_invalido' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  await Promise.resolve(authMiddleware(req, res, next));

  expect(jwt.verify).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
});

