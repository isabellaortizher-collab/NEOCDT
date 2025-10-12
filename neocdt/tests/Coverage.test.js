// tests/Coverage.test.js
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

const Usuario = require('../src/models/Usuario');
const CDT = require('../src/models/CDT');
const ContenidoCDT = require('../src/models/ContenidoCDT');

const cdtCtrl = require('../src/controllers/cdtController');
const authCtrl = require('../src/controllers/authController');
const bcrypt = require('bcryptjs');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI + '_coverageFinal');
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

afterEach(() => {
  jest.restoreAllMocks();
});

/**
 * Helpers
 */
function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

/**
 * HTTP tests combinados (ya tenías muchos; los mantenemos para cobertura de rutas)
 */
describe('Coverage final - forzar catches y ramas faltantes (HTTP)', () => {

  test('A - forzar error en listarCDTs -> ejecuta catch y responde 500', async () => {
    await request(app).post('/api/auth/register').send({ nombreUsuario:'fA', nombreCompleto:'F A', correo:'fA@test', contrasena:'123' }).expect(201);
    const login = await request(app).post('/api/auth/login').send({ correo:'fA@test', contrasena:'123' }).expect(200);
    const token = login.body.token;

    jest.spyOn(CDT, 'find').mockImplementation(() => { throw new Error('simulated find error'); });

    const res = await request(app).get('/api/cdts').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBeGreaterThanOrEqual(499); // ideal 500
  });

  test('B - forzar error en actualizarContenido (save) -> ejecuta catch y responde 500', async () => {
    await request(app).post('/api/auth/register').send({ nombreUsuario:'fB', nombreCompleto:'F B', correo:'fB@test', contrasena:'123' }).expect(201);
    const login = await request(app).post('/api/auth/login').send({ correo:'fB@test', contrasena:'123' }).expect(200);
    const token = login.body.token;

    const create = await request(app)
      .post('/api/cdts')
      .set('Authorization', `Bearer ${token}`)
      .send({ descripcion:'cdt-fB', contenido:{ montoPrincipal:'10', tasaInteres:'0.01', plazoMeses:1 } })
      .expect(201);
    const cdtId = create.body.cdt._id;

    jest.spyOn(ContenidoCDT.prototype, 'save').mockImplementation(() => { throw new Error('simulated save error for update'); });

    const res = await request(app)
      .post(`/api/cdts/${cdtId}/contenido`)
      .set('Authorization', `Bearer ${token}`)
      .send({ tipoSolicitud:'apertura', estado:'en_validacion', montoPrincipal:'20', tasaInteres:'0.02', plazoMeses:2 });

    expect(res.status).toBeGreaterThanOrEqual(499);
  });

  test('C - forzar error en historial (ContenidoCDT.find) -> ejecuta catch y responde 500', async () => {
    await request(app).post('/api/auth/register').send({ nombreUsuario:'fC', nombreCompleto:'F C', correo:'fC@test', contrasena:'123' }).expect(201);
    const login = await request(app).post('/api/auth/login').send({ correo:'fC@test', contrasena:'123' }).expect(200);
    const token = login.body.token;

    const create = await request(app)
      .post('/api/cdts')
      .set('Authorization', `Bearer ${token}`)
      .send({ descripcion:'cdt-fC', contenido:{ montoPrincipal:'10', tasaInteres:'0.01', plazoMeses:1 } })
      .expect(201);
    const cdtId = create.body.cdt._id;

    jest.spyOn(ContenidoCDT, 'find').mockImplementation(() => { throw new Error('simulated find error in historial'); });

    const res = await request(app).get(`/api/cdts/${cdtId}/historial`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBeGreaterThanOrEqual(499);
  });

  test('Auth.register -> forzar error interno y retorna 500 (HTTP)', async () => {
    jest.spyOn(Usuario, 'findOne').mockRejectedValue(new Error('simulated find error'));

    const user = { nombreUsuario:'errReg', nombreCompleto:'Err Reg', correo:'errreg@test', contrasena:'123' };
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  test('CDT.crearCDT -> rechaza cuando falta montoPrincipal (mensaje de validación) (HTTP)', async () => {
    await request(app).post('/api/auth/register').send({ nombreUsuario:'val1', nombreCompleto:'Val 1', correo:'val1@test', contrasena:'pass' });
    const login = await request(app).post('/api/auth/login').send({ correo:'val1@test', contrasena:'pass' });
    const token = login.body.token;

    const res = await request(app)
      .post('/api/cdts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        descripcion: 'validacion contenido',
        contenido: { tasaInteres: '0.03', plazoMeses: 6 }
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.error).toBeDefined();
    expect(String(res.body.error)).toMatch(/montoPrincipal|required|montoPrincipal requerido|montoPrincipal/);
  });

  test('CDT.crearCDT -> si CDT.save lanza ValidationError responde 400 (HTTP)', async () => {
    await request(app).post('/api/auth/register').send({ nombreUsuario:'val2', nombreCompleto:'Val 2', correo:'val2@test', contrasena:'pass' });
    const login = await request(app).post('/api/auth/login').send({ correo:'val2@test', contrasena:'pass' });
    const token = login.body.token;

    jest.spyOn(CDT.prototype, 'save').mockImplementation(() => {
      const e = new Error('simulated validation error');
      e.name = 'ValidationError';
      throw e;
    });

    const res = await request(app)
      .post('/api/cdts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        descripcion: 'cdt val err',
        contenido: { montoPrincipal: '100', tasaInteres: '0.02', plazoMeses: 3 }
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('CDT.actualizarContenido -> si ContenidoCDT.save lanza ValidationError responde 400 (HTTP)', async () => {
    await request(app).post('/api/auth/register').send({ nombreUsuario:'val3', nombreCompleto:'Val 3', correo:'val3@test', contrasena:'pass' });
    const login = await request(app).post('/api/auth/login').send({ correo:'val3@test', contrasena:'pass' });
    const token = login.body.token;

    const create = await request(app)
      .post('/api/cdts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        descripcion: 'cdt to update',
        contenido: { montoPrincipal: '50', tasaInteres: '0.01', plazoMeses: 1 }
      })
      .expect(201);

    const idCDT = create.body.cdt._id;

    jest.spyOn(ContenidoCDT.prototype, 'save').mockImplementation(() => {
      const e = new Error('simulated validation error in contenido');
      e.name = 'ValidationError';
      throw e;
    });

    const res = await request(app)
      .post(`/api/cdts/${idCDT}/contenido`)
      .set('Authorization', `Bearer ${token}`)
      .send({ tipoSolicitud: 'apertura', estado: 'borrador', montoPrincipal:'500', tasaInteres:'0.03', plazoMeses:6 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('CDT.crearCDT -> rechaza cuando contenido es null (contenido requerido) (HTTP)', async () => {
    await request(app).post('/api/auth/register').send({ nombreUsuario:'vcn1', nombreCompleto:'VCN 1', correo:'vcn1@test', contrasena:'p' });
    const login = await request(app).post('/api/auth/login').send({ correo:'vcn1@test', contrasena:'p' });
    const token = login.body.token;

    const res = await request(app)
      .post('/api/cdts')
      .set('Authorization', `Bearer ${token}`)
      .send({ descripcion: 'sin contenido' });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.error).toBeDefined();
    expect(String(res.body.error)).toMatch(/contenido requerido/);
  });

  test('CDT.crearCDT -> rechaza cuando falta tasaInteres (tasaInteres requerido) (HTTP)', async () => {
    await request(app).post('/api/auth/register').send({ nombreUsuario:'vtn1', nombreCompleto:'VTN 1', correo:'vtn1@test', contrasena:'p' });
    const login = await request(app).post('/api/auth/login').send({ correo:'vtn1@test', contrasena:'p' });
    const token = login.body.token;

    const res = await request(app)
      .post('/api/cdts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        descripcion: 'sin tasa',
        contenido: { montoPrincipal: '100' , plazoMeses: 6 }
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.error).toBeDefined();
    expect(String(res.body.error)).toMatch(/tasaInteres requerido/);
  });

  test('CDT.crearCDT -> rechaza cuando plazoMeses es null (plazoMeses requerido) (HTTP)', async () => {
    await request(app).post('/api/auth/register').send({ nombreUsuario:'vpm1', nombreCompleto:'VPM 1', correo:'vpm1@test', contrasena:'p' });
    const login = await request(app).post('/api/auth/login').send({ correo:'vpm1@test', contrasena:'p' });
    const token = login.body.token;

    const res = await request(app)
      .post('/api/cdts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        descripcion: 'sin plazo',
        contenido: { montoPrincipal: '100', tasaInteres: '0.02' }
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.error).toBeDefined();
    expect(String(res.body.error)).toMatch(/plazoMeses requerido/);
  });

  test('CDT.actualizarContenido -> rechaza con 404 si CDT no existe (HTTP)', async () => {
    await request(app).post('/api/auth/register').send({ nombreUsuario:'notf', nombreCompleto:'Not F', correo:'notf@test', contrasena:'p' });
    const login = await request(app).post('/api/auth/login').send({ correo:'notf@test', contrasena:'p' });
    const token = login.body.token;

    const fakeId = '000000000000000000000000';
    const res = await request(app)
      .post(`/api/cdts/${fakeId}/contenido`)
      .set('Authorization', `Bearer ${token}`)
      .send({ montoPrincipal:'1000.00', tasaInteres:'0.03', plazoMeses:6 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test('GET / -> responde ok (HTTP)', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });
});

/**
 * Unit tests directos al controlador (cubren líneas internas no siempre alcanzadas por HTTP)
 */
describe('Coverage final - pruebas unitarias directas a controlador y Auth.register', () => {

  test('Unit - crearCDT -> rechaza cuando descripcion es whitespace (descripcion requerida)', async () => {
    const req = {
      body: { descripcion: '   ', contenido: { montoPrincipal: '100', tasaInteres: '0.02', plazoMeses: 1 } },
      user: { userId: 'u1' }
    };
    const res = makeRes();

    await cdtCtrl.crearCDT(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    const calledWith = res.json.mock.calls[0][0];
    expect(calledWith).toHaveProperty('error');
    expect(String(calledWith.error)).toMatch(/descripcion requerida/);
  });

  test('Unit - crearCDT -> contenido null -> "contenido requerido"', async () => {
    const req = { body: { descripcion: 'x' }, user: { userId: 'uX' } };
    const res = makeRes();

    await cdtCtrl.crearCDT(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const called = res.json.mock.calls[0][0];
    expect(String(called.error)).toMatch(/contenido requerido/);
  });

  test('Unit - crearCDT -> falta montoPrincipal -> "montoPrincipal requerido"', async () => {
    const req = { body: { descripcion: 'x', contenido: { tasaInteres: '0.02', plazoMeses: 1 } }, user: { userId: 'uX' } };
    const res = makeRes();

    await cdtCtrl.crearCDT(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const called = res.json.mock.calls[0][0];
    expect(String(called.error)).toMatch(/montoPrincipal requerido/);
  });

  test('Unit - crearCDT -> falta tasaInteres -> "tasaInteres requerido"', async () => {
    const req = { body: { descripcion: 'x', contenido: { montoPrincipal: '10', plazoMeses: 1 } }, user: { userId: 'uX' } };
    const res = makeRes();

    await cdtCtrl.crearCDT(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const called = res.json.mock.calls[0][0];
    expect(String(called.error)).toMatch(/tasaInteres requerido/);
  });

  test('Unit - crearCDT -> falta plazoMeses -> "plazoMeses requerido"', async () => {
    const req = { body: { descripcion: 'x', contenido: { montoPrincipal: '10', tasaInteres: '0.02' } }, user: { userId: 'uX' } };
    const res = makeRes();

    await cdtCtrl.crearCDT(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const called = res.json.mock.calls[0][0];
    expect(String(called.error)).toMatch(/plazoMeses requerido/);
  });

  test('Unit - actualizarContenido -> 404 si CDT.findById devuelve null', async () => {
    const req = { params: { idCDT: '000000000000000000000000' }, body: { montoPrincipal:'100', tasaInteres:'0.02', plazoMeses:1 }, user: { userId: 'uZ' } };
    const res = makeRes();

    jest.spyOn(CDT, 'findById').mockResolvedValue(null);

    await cdtCtrl.actualizarContenido(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    const called = res.json.mock.calls[0][0];
    expect(called).toHaveProperty('error');
  });

  test('Unit - Auth.register -> forzar error en bcrypt.genSalt y ejecutar catch', async () => {
    const req = { body: { nombreUsuario:'uErr', nombreCompleto:'Err', correo:'err@test', contrasena:'x' } };
    const res = makeRes();

    // mock findOne para devolver null (seguir flujo hasta genSalt)
    jest.spyOn(Usuario, 'findOne').mockResolvedValue(null);
    // mockear genSalt para que falle y provoque el catch
    jest.spyOn(bcrypt, 'genSalt').mockRejectedValue(new Error('genSalt error'));

    await authCtrl.register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const called = res.json.mock.calls[0][0];
    expect(called).toHaveProperty('error');
  });
});
