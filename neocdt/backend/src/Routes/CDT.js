const express = require('express');
const router = express.Router();
const cdtCtrl = require('../controllers/cdtController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, cdtCtrl.crearCDT);       // Crear CDT
router.get('/', auth, cdtCtrl.listarCDTs);      // Listar CDTs
router.post('/:idCDT/renovar', auth, cdtCtrl.renovarCDT); // Renovar CDT

module.exports = router;
