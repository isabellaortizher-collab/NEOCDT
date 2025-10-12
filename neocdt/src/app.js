require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:5175', // ⚠️ usa el puerto real que te muestra Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware para interpretar JSON
app.use(express.json());

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

