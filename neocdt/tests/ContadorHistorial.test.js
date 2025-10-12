const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

let token, cdtId;
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI + '_testHistCount');
  await request(app).post('/api/auth/register').send({ nombreUsuario:'hist', nombreCompleto:'Hist', correo:'hist@test', contrasena:'12345' });
  const login = await request(app).post('/api/auth/login').send({ correo:'hist@test', contrasena:'12345' });
  token = login.body.token;
});
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

test('historial aumenta con cada actualización', async () => {
  const c1 = await request(app)
    .post('/api/cdts')
    .set('Authorization', `Bearer ${token}`)
    .send({ descripcion:'CDT h', contenido:{ montoPrincipal:'1000', tasaInteres:'0.03', plazoMeses:6 } })
    .expect(201);
  cdtId = c1.body.cdt._id;

  await request(app)
    .post(`/api/cdts/${cdtId}/contenido`)
    .set('Authorization', `Bearer ${token}`)
    .send({ montoPrincipal:'2000', tasaInteres:'0.04', plazoMeses:6 })
    .expect(201);

  await request(app)
    .post(`/api/cdts/${cdtId}/contenido`)
    .set('Authorization', `Bearer ${token}`)
    .send({ montoPrincipal:'2500', tasaInteres:'0.045', plazoMeses:12 })
    .expect(201);

  const hist = await request(app)
    .get(`/api/cdts/${cdtId}/historial`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  expect(hist.body.length).toBe(3);
});


