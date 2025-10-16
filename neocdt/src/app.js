require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// CORS para Vite
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /localhost:(5173|5174|5175)/.test(origin)) return cb(null, true);
    return cb(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Rutas
try {
  app.use('/api/auth', require('./Routes/Auth'));
} catch(e) {
  console.error('Error cargando rutas de auth:', e.message);
}

// Monta las rutas de CDT
try {
  app.use('/api/cdts', require('./Routes/CDT'));
} catch(e) {
  console.error('Error cargando rutas de cdts:', e.message);
}

// Ruta de prueba
app.get('/', (req, res) => res.json({ ok: true, message: 'API NeoCDT funcionando' }));

module.exports = app;

