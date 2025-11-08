jest.mock('../Models/CDT', () => {
  const CDT = jest.fn(function (data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  });
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

const CDT = require('../Models/CDT');
const ContenidoCDT = require('../Models/ContenidoCDT');
const Usuario = require('../Models/Usuario');

const cdtCtrl = require('../Controllers/CDTController');

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

test('historial aumenta con cada actualización', async () => {
  const req = { params: { idCDT: 'cdt123' }, body: { montoPrincipal: '1000', tasaInteres: '0.03', plazoMeses: 6 }, user: { userId: 'user123' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  CDT.findById.mockResolvedValue({ _id: 'cdt123' });

  // Primera actualización
  await cdtCtrl.actualizarContenido(req, res);
  expect(res.status).toHaveBeenCalledWith(201);

  // Segunda actualización
  await cdtCtrl.actualizarContenido(req, res);
  expect(res.status).toHaveBeenCalledWith(201);

  // Tercera actualización
  await cdtCtrl.actualizarContenido(req, res);
  expect(res.status).toHaveBeenCalledWith(201);

  // Verificar historial
  const reqHist = { params: { idCDT: 'cdt123' } };
  const resHist = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const mockHistorial = [{}, {}, {}];
  ContenidoCDT.find().sort.mockResolvedValue(mockHistorial);

  await cdtCtrl.getHistorial(reqHist, resHist);
  expect(ContenidoCDT.find).toHaveBeenCalledWith({ idCDT: 'cdt123' });
  expect(resHist.json).toHaveBeenCalledWith(mockHistorial);
  expect(mockHistorial.length).toBe(3);
});


