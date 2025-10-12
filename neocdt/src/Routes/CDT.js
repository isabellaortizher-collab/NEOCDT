const express = require('express');
const router = express.Router();
const cdtCtrl = require('../controllers/cdtController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, cdtCtrl.crearCDT);
router.get('/', auth, cdtCtrl.listarCDTs);
router.post('/:idCDT/contenido', auth, cdtCtrl.actualizarContenido);
router.get('/:idCDT/historial', auth, cdtCtrl.historial);

module.exports = router;