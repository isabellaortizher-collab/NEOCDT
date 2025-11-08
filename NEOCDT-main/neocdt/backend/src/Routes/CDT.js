const express = require('express');
const router = express.Router();
const cdtCtrl = require('../Controllers/CDTController');
const auth = require('../Middleware/AuthMiddleware');

// Rutas para gestión de CDT (todas protegidas por autenticación)
router.post('/', auth, cdtCtrl.crearCDT);       // Crear CDT
router.get('/', auth, cdtCtrl.listarCDTs);      // Listar CDTs del usuario
router.post('/:idCDT/renovar', auth, cdtCtrl.renovarCDT); // Renovar CDT
router.post('/:idCDT/contenido', auth, cdtCtrl.actualizarContenido); // Actualizar contenido
router.get('/:idCDT/historial', auth, cdtCtrl.getHistorial); // Obtener historial

module.exports = router;
