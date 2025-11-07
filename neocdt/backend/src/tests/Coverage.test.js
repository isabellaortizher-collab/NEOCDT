jest.mock('../Models/CDT', () => {
  const CDT = jest.fn(function (data) {
    Object.assign(this, data);
  });
  CDT.prototype.save = jest.fn().mockResolvedValue(this);
  CDT.find = jest.fn();
  CDT.findById = jest.fn();
  return CDT;
});

jest.mock('../Models/ContenidoCDT', () => {
  const ContenidoCDT = jest.fn(function (data) {
    Object.assign(this, data);
  });
  ContenidoCDT.prototype.save = jest.fn().mockResolvedValue(this);
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

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const CDT = require('../Models/CDT');
const ContenidoCDT = require('../Models/ContenidoCDT');
const Usuario = require('../Models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const cdtCtrl = require('../Controllers/CDTController');
const authCtrl = require('../Controllers/AuthController');

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
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
 * Unit tests directos al controlador 
 */
describe('Coverage final - pruebas unitarias directas a controlador y Auth.register', () => {

  test('crearCDT -> rechaza cuando descripcion es whitespace (descripcion requerida)', async () => {
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

  test('crearCDT -> contenido null -> "contenido requerido"', async () => {
    const req = { body: { descripcion: 'x' }, user: { userId: 'uX' } };
    const res = makeRes();

    await cdtCtrl.crearCDT(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const called = res.json.mock.calls[0][0];
    expect(String(called.error)).toMatch(/contenido requerido/);
  });

  test('crearCDT -> falta montoPrincipal -> "montoPrincipal requerido"', async () => {
    const req = { body: { descripcion: 'x', contenido: { tasaInteres: '0.02', plazoMeses: 1 } }, user: { userId: 'uX' } };
    const res = makeRes();

    await cdtCtrl.crearCDT(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const called = res.json.mock.calls[0][0];
    expect(String(called.error)).toMatch(/montoPrincipal requerido/);
  });

  test('crearCDT -> falta tasaInteres -> "tasaInteres requerido"', async () => {
    const req = { body: { descripcion: 'x', contenido: { montoPrincipal: '10', plazoMeses: 1 } }, user: { userId: 'uX' } };
    const res = makeRes();

    await cdtCtrl.crearCDT(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const called = res.json.mock.calls[0][0];
    expect(String(called.error)).toMatch(/tasaInteres requerido/);
  });

  test('crearCDT -> falta plazoMeses -> "plazoMeses requerido"', async () => {
    const req = { body: { descripcion: 'x', contenido: { montoPrincipal: '10', tasaInteres: '0.02' } }, user: { userId: 'uX' } };
    const res = makeRes();

    await cdtCtrl.crearCDT(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const called = res.json.mock.calls[0][0];
    expect(String(called.error)).toMatch(/plazoMeses requerido/);
  });

  test('actualizarContenido -> 404 si CDT.findById devuelve null', async () => {
    const req = { params: { idCDT: '000000000000000000000000' }, body: { montoPrincipal:'100', tasaInteres:'0.02', plazoMeses:1 }, user: { userId: 'uZ' } };
    const res = makeRes();

    jest.spyOn(CDT, 'findById').mockResolvedValue(null);

    await cdtCtrl.actualizarContenido(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    const called = res.json.mock.calls[0][0];
    expect(called).toHaveProperty('error');
  });

  test('Auth.register -> forzar error en bcrypt.genSalt y ejecutar catch', async () => {
    const req = { body: { nombreUsuario:'uErr', nombreCompleto:'Err', correo:'err@test', contrasena:'x' } };
    const res = makeRes();

    // mock findOne para devolver null (seguir flujo hasta genSalt)
    Usuario.findOne.mockResolvedValue(null);
    // mockear genSalt para que falle y provoque el catch
    bcrypt.genSalt.mockRejectedValue(new Error('genSalt error'));

    await authCtrl.register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const called = res.json.mock.calls[0][0];
    expect(called).toHaveProperty('error');
  });

  test('listarCDTs -> forzar error en CDT.find y ejecutar catch', async () => {
    const req = { user: { userId: 'u1' } };
    const res = makeRes();

    CDT.find.mockRejectedValue(new Error('simulated find error'));

    await cdtCtrl.listarCDTs(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const called = res.json.mock.calls[0][0];
    expect(called).toHaveProperty('error');
  });

  test('actualizarContenido -> forzar error en ContenidoCDT save y ejecutar catch', async () => {
    const req = { params: { idCDT: 'cdt123' }, body: { montoPrincipal:'100', tasaInteres:'0.02', plazoMeses:1 }, user: { userId: 'u1' } };
    const res = makeRes();

    CDT.findById.mockResolvedValue({ _id: 'cdt123' });
    // Mock the save method on the prototype to reject
    ContenidoCDT.prototype.save.mockRejectedValueOnce(new Error('simulated save error'));

    await cdtCtrl.actualizarContenido(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const called = res.json.mock.calls[0][0];
    expect(called).toHaveProperty('error');
  });

  test('getHistorial -> forzar error en ContenidoCDT.find y ejecutar catch', async () => {
    const req = { params: { idCDT: 'cdt123' } };
    const res = makeRes();

    ContenidoCDT.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('simulated find error'))
    });

    await cdtCtrl.getHistorial(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const called = res.json.mock.calls[0][0];
    expect(called).toHaveProperty('error');
  });

  test('crearCDT -> forzar ValidationError en CDT.save', async () => {
    const req = { body: { descripcion: 'x', contenido: { montoPrincipal: '100', tasaInteres: '0.02', plazoMeses: 1 } }, user: { userId: 'u1' } };
    const res = makeRes();

    const validationError = new Error('simulated validation error');
    validationError.name = 'ValidationError';
    // Mock the save method on the prototype to reject with ValidationError
    CDT.prototype.save.mockRejectedValueOnce(validationError);

    await cdtCtrl.crearCDT(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const called = res.json.mock.calls[0][0];
    expect(called).toHaveProperty('error');
  });

  test('actualizarContenido -> forzar ValidationError en ContenidoCDT.save', async () => {
    const req = { params: { idCDT: 'cdt123' }, body: { montoPrincipal:'100', tasaInteres:'0.02', plazoMeses:1 }, user: { userId: 'u1' } };
    const res = makeRes();

    CDT.findById.mockResolvedValue({ _id: 'cdt123' });
    const validationError = new Error('simulated validation error');
    validationError.name = 'ValidationError';
    // Mock the save method on the prototype to reject with ValidationError
    ContenidoCDT.prototype.save.mockRejectedValueOnce(validationError);

    await cdtCtrl.actualizarContenido(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const called = res.json.mock.calls[0][0];
    expect(called).toHaveProperty('error');
  });

  test('renovarCDT -> 404 si CDT no existe', async () => {
    const req = { params: { idCDT: 'invalid' } };
    const res = makeRes();

    CDT.findById.mockResolvedValue(null);

    await cdtCtrl.renovarCDT(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    const called = res.json.mock.calls[0][0];
    expect(called).toHaveProperty('error');
  });

  test('renovarCDT -> forzar error en save', async () => {
    const req = { params: { idCDT: 'cdt123' } };
    const res = makeRes();

    const mockCDT = {
      usuarioId: 'u1',
      monto: 1000,
      fechaVencimiento: new Date('2023-03-01T00:00:00Z'),
      renovacionAutomatica: true
    };
    CDT.findById.mockResolvedValue(mockCDT);
    // Mock the save method on the prototype to reject for the new CDT instance
    CDT.prototype.save.mockRejectedValueOnce(new Error('save error'));

    await cdtCtrl.renovarCDT(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const called = res.json.mock.calls[0][0];
    expect(called).toHaveProperty('error');
  });
});
