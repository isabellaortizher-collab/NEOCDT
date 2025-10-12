const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI + '_cdtTest');
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

test('registro, login, crear CDT, actualizar contenido y obtener historial', async () => {
  // registro
  const usuario = { nombreUsuario: 'testuser', nombreCompleto: 'Test User', correo: 'test@local', contrasena: 'pass123' };
  await request(app).post('/api/auth/register').send(usuario).expect(201);

  // login
  const loginRes = await request(app).post('/api/auth/login').send({ correo: usuario.correo, contrasena: usuario.contrasena }).expect(200);
  const token = loginRes.body.token;
  expect(token).toBeDefined();

  // crear CDT
  const createRes = await request(app)
    .post('/api/cdts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      descripcion: 'cdt test',
      contenido: {
        tipoSolicitud: 'apertura',
        estado: 'borrador',
        montoPrincipal: '500.00',
        tasaInteres: '0.03',
        plazoMeses: 6,
        canal: 'web'
      }
    })
    .expect(201);

  const cdtId = createRes.body.cdt._id;
  expect(cdtId).toBeDefined();
  expect(createRes.body.contenido).toBeDefined();

  // actualizar contenido (añade nueva entrada)
  const updRes = await request(app)
    .post(`/api/cdts/${cdtId}/contenido`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      tipoSolicitud: 'renovacion',
      estado: 'en_validacion',
      montoPrincipal: '600.00',
      tasaInteres: '0.035',
      plazoMeses: 12
    })
    .expect(201);
  expect(updRes.body._id).toBeDefined();

  // obtener historial
  const histRes = await request(app)
    .get(`/api/cdts/${cdtId}/historial`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  expect(Array.isArray(histRes.body)).toBe(true);
  expect(histRes.body.length).toBeGreaterThanOrEqual(2);
});


// validaciones
test('rechaza creación sin descripción', async () => {
  // creamos usuario y token para este test
  const usuario = { nombreUsuario: 'vuser', nombreCompleto: 'V User', correo: 'vuser@test', contrasena: 'vpass' };
  await request(app).post('/api/auth/register').send(usuario).expect(201);
  const login = await request(app).post('/api/auth/login').send({ correo: usuario.correo, contrasena: usuario.contrasena }).expect(200);
  const token = login.body.token;

  const res = await request(app)
    .post('/api/cdts')
    .set('Authorization', `Bearer ${token}`)
    .send({ contenido:{ montoPrincipal:'500', tasaInteres:'0.03', plazoMeses:6 } });
  expect(res.status).toBeGreaterThanOrEqual(400);
});

test('rechaza actualización con CDT inexistente', async () => {
  const usuario = { nombreUsuario: 'nfuser', nombreCompleto: 'NF User', correo: 'nf@test', contrasena: 'nfpass' };
  await request(app).post('/api/auth/register').send(usuario).expect(201);
  const login = await request(app).post('/api/auth/login').send({ correo: usuario.correo, contrasena: usuario.contrasena }).expect(200);
  const token = login.body.token;

  const fakeId = '000000000000000000000000';
  const res = await request(app)
    .post(`/api/cdts/${fakeId}/contenido`)
    .set('Authorization', `Bearer ${token}`)
    .send({ montoPrincipal:'1000.00', tasaInteres:'0.03', plazoMeses:6 });
  expect([400,404,500]).toContain(res.status);
});

test('rechaza petición sin token', async () => {
  const res = await request(app)
    .post('/api/cdts')
    .send({ descripcion:'x', contenido:{ montoPrincipal:'500', tasaInteres:'0.03', plazoMeses:6 } });
  expect(res.status).toBe(401);
});

/**
 * US01 & US02 (GHERKIN) - Cliente nuevo se registra y abre un CDT digital (historial inicial)
 */
test('US01/US02: Usuario nuevo se registra y abre un CDT (historial inicial)', async () => {
  const user = { nombreUsuario:'us01', nombreCompleto:'Usuario 01', correo:'us01@test', contrasena:'pass01', numeroDocumento:'111' };
  await request(app).post('/api/auth/register').send(user).expect(201);

  const login = await request(app).post('/api/auth/login').send({ correo: user.correo, contrasena: user.contrasena }).expect(200);
  const token = login.body.token;
  expect(token).toBeDefined();

  const create = await request(app)
    .post('/api/cdts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      descripcion: 'US01 CDT digital',
      contenido: { tipoSolicitud:'apertura', estado:'borrador', montoPrincipal:'1200.00', tasaInteres:'0.035', plazoMeses:12 }
    })
    .expect(201);

  const cdtId = create.body.cdt._id;
  const hist = await request(app).get(`/api/cdts/${cdtId}/historial`).set('Authorization', `Bearer ${token}`).expect(200);
  expect(Array.isArray(hist.body)).toBe(true);
  expect(hist.body.length).toBeGreaterThanOrEqual(1);
  expect(hist.body[0].tipoSolicitud).toBe('apertura');
});

/**
 * US03 (GHERKIN) - Reutilizar datos, seguimiento estado y renovación manual
 */
test('US03: Cliente reutiliza datos, consulta estado y realiza renovación manual', async () => {
  const user = { nombreUsuario:'us03', nombreCompleto:'Usuario 03', correo:'us03@test', contrasena:'pass03' };
  await request(app).post('/api/auth/register').send(user).expect(201);
  const login = await request(app).post('/api/auth/login').send({ correo:user.correo, contrasena:user.contrasena }).expect(200);
  const token = login.body.token;

  const create = await request(app)
    .post('/api/cdts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      descripcion: 'US03 CDT',
      contenido: { tipoSolicitud:'apertura', estado:'borrador', montoPrincipal:'800.00', tasaInteres:'0.03', plazoMeses:6 }
    }).expect(201);

  const cdtId = create.body.cdt._id;

  // actualizar estado a "en_validacion"
  await request(app)
    .post(`/api/cdts/${cdtId}/contenido`)
    .set('Authorization', `Bearer ${token}`)
    .send({ tipoSolicitud:'apertura', estado:'en_validacion', montoPrincipal:'800.00', tasaInteres:'0.03', plazoMeses:6 })
    .expect(201);

  // renovación manual
  await request(app)
    .post(`/api/cdts/${cdtId}/contenido`)
    .set('Authorization', `Bearer ${token}`)
    .send({ tipoSolicitud:'renovacion', estado:'en_validacion', montoPrincipal:'900.00', tasaInteres:'0.032', plazoMeses:12 })
    .expect(201);

  const hist = await request(app).get(`/api/cdts/${cdtId}/historial`).set('Authorization', `Bearer ${token}`).expect(200);
  expect(Array.isArray(hist.body)).toBe(true);
  expect(hist.body[hist.body.length - 1].tipoSolicitud).toBe('renovacion');
});

/**
 * US06 (GHERKIN) - Agente (simplificado: validamos que usuarios ven solo sus CDTs)
 */
test('US06: Cada usuario ve sus propias solicitudes (base para panel de agente)', async () => {
  // crear usuario A
  await request(app).post('/api/auth/register').send({ nombreUsuario:'agentA', nombreCompleto:'A', correo:'a@test', contrasena:'aa' }).expect(201);
  const loginA = await request(app).post('/api/auth/login').send({ correo:'a@test', contrasena:'aa' }).expect(200);
  const tokenA = loginA.body.token;

  // crear usuario B
  await request(app).post('/api/auth/register').send({ nombreUsuario:'agentB', nombreCompleto:'B', correo:'b@test', contrasena:'bb' }).expect(201);
  const loginB = await request(app).post('/api/auth/login').send({ correo:'b@test', contrasena:'bb' }).expect(200);
  const tokenB = loginB.body.token;

  // A crea 1 CDT
  await request(app).post('/api/cdts').set('Authorization', `Bearer ${tokenA}`)
    .send({ descripcion:'A-CDT', contenido:{ montoPrincipal:'100', tasaInteres:'0.01', plazoMeses:3 } }).expect(201);

  // B crea 2 CDTs
  await request(app).post('/api/cdts').set('Authorization', `Bearer ${tokenB}`)
    .send({ descripcion:'B-CDT-1', contenido:{ montoPrincipal:'200', tasaInteres:'0.02', plazoMeses:6 } }).expect(201);
  await request(app).post('/api/cdts').set('Authorization', `Bearer ${tokenB}`)
    .send({ descripcion:'B-CDT-2', contenido:{ montoPrincipal:'300', tasaInteres:'0.025', plazoMeses:12 } }).expect(201);

  // listar CDTs usuario A (debe tener 1)
  const listA = await request(app).get('/api/cdts').set('Authorization', `Bearer ${tokenA}`).expect(200);
  expect(Array.isArray(listA.body)).toBe(true);
  expect(listA.body.length).toBe(1);

  // listar CDTs usuario B (debe tener 2)
  const listB = await request(app).get('/api/cdts').set('Authorization', `Bearer ${tokenB}`).expect(200);
  expect(Array.isArray(listB.body)).toBe(true);
  expect(listB.body.length).toBe(2);
});

/**
 * US07 (GHERKIN) - Cancelación y autenticación requerida
 */
test('US07: Cliente puede cancelar solicitud en borrador y petición requiere autenticación', async () => {
  // registrar + login
  await request(app).post('/api/auth/register').send({ nombreUsuario:'canc', nombreCompleto:'Canc', correo:'canc@test', contrasena:'123' }).expect(201);
  const login = await request(app).post('/api/auth/login').send({ correo:'canc@test', contrasena:'123' }).expect(200);
  const token = login.body.token;

  // crear CDT en borrador
  const create = await request(app).post('/api/cdts').set('Authorization', `Bearer ${token}`)
    .send({ descripcion:'CDT cancel', contenido:{ montoPrincipal:'400', tasaInteres:'0.02', plazoMeses:6 } }).expect(201);
  const cdtId = create.body.cdt._id;

  // intento cancel sin token -> debe 401
  await request(app).post(`/api/cdts/${cdtId}/contenido`).send({ tipoSolicitud:'cancelacion', estado:'cancelada', montoPrincipal:'0', tasaInteres:'0', plazoMeses:0 })
    .expect(401);

  // cancel con token -> crea entrada cancelada
  await request(app).post(`/api/cdts/${cdtId}/contenido`).set('Authorization', `Bearer ${token}`)
    .send({ tipoSolicitud:'cancelacion', estado:'cancelada', montoPrincipal:'0', tasaInteres:'0', plazoMeses:0 })
    .expect(201);

  // verificar historial última entrada es cancelada
  const hist = await request(app).get(`/api/cdts/${cdtId}/historial`).set('Authorization', `Bearer ${token}`).expect(200);
  expect(hist.body[hist.body.length - 1].tipoSolicitud).toBe('cancelacion');
  expect(hist.body[hist.body.length - 1].estado).toBe('cancelada');
});

