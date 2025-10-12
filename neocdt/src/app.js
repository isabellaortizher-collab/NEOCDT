require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Allow the common Vite dev ports during local development
app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (e.g., curl, mobile) or from localhost Vite dev servers
    if (!origin || /localhost:(5173|5174|5175)/.test(origin)) return cb(null, true);
    return cb(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware para interpretar JSON
app.use(express.json());

// Simple request logger for debugging login issues
app.use((req, res, next) => {
  if (req.path === '/api/auth/login' && req.method === 'POST') {
    console.log('\n[LOGIN DEBUG] Incoming login request:');
    console.log('Origin:', req.get('origin'));
    console.log('Content-Type:', req.get('content-type'));
    // log body safely; don't print passwords in prod
    console.log('Body keys:', Object.keys(req.body || {}));
  }
  next();
});

// 🔗 Importar rutas
try { app.use('/api/auth', require('./routes/auth')); } catch (e) {
  console.error('Error cargando rutas de auth:', e.message);
}

try { app.use('/api/cdts', require('./routes/cdt')); } catch (e) {
  console.error('Error cargando rutas de cdts:', e.message);
}

// Ruta base para verificar que el servidor funcione
app.get('/', (req, res) => res.json({ ok: true, message: 'API NeoCDT funcionando' }));

module.exports = app;

