// tests/Auth.test.js
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI + '_authTest');
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

test('registro y login exitoso', async () => {
  const user = { nombreUsuario:'t', nombreCompleto:'T', correo:'t@test.com', contrasena:'12345' };
  await request(app).post('/api/auth/register').send(user).expect(201);
  const login = await request(app).post('/api/auth/login').send({ correo:'t@test.com', contrasena:'12345' }).expect(200);
  expect(login.body.token).toBeDefined();
});

test('rechaza registro duplicado por correo', async () => {
  const usuario = { nombreUsuario:'dupUser', nombreCompleto:'Dup User', correo:'dup@test.com', contrasena:'12345' };
  await request(app).post('/api/auth/register').send(usuario).expect(201);
  const res2 = await request(app).post('/api/auth/register').send(usuario).expect(400);
  expect(res2.body.error).toContain('Usuario ya existe');
});

test('rechaza login con contraseña incorrecta', async () => {
  const usuario = { nombreUsuario:'loginFail', nombreCompleto:'Login Fail', correo:'fail@test.com', contrasena:'pass123' };
  await request(app).post('/api/auth/register').send(usuario).expect(201);
  const res = await request(app).post('/api/auth/login').send({ correo:usuario.correo, contrasena:'mala' }).expect(400);
  expect(res.body.error).toContain('Credenciales inválidas');
});

// ✅ test que cubre el catch interno de login
test('forzar error interno en login', async () => {
  // mock findOne para saltar validaciones 400
  jest.spyOn(require('../src/models/Usuario'), 'findOne').mockResolvedValue({ contrasena: await bcrypt.hash('123', 10), _id: '1', rol:'user', save: jest.fn() });
  jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
  jest.spyOn(jwt, 'sign').mockImplementation(() => { throw new Error('jwt error'); });

  await request(app).post('/api/auth/login').send({ correo:'x@test', contrasena:'123' }).expect(500);

  jest.restoreAllMocks();
});

test('rechaza token inválido (AuthMiddleware)', async () => {
  const res = await request(app)
    .get('/api/cdts')
    .set('Authorization', 'Bearer token_invalido')
    .expect(401);
  expect(res.body.error).toBeDefined();
});

