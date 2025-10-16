// controllers/cdtController.js
const CDT = require('../Models/CDT');
const Usuario = require('../Models/Usuario');

// Crear un nuevo CDT
exports.crearCDT = async (req, res) => {
  const { monto, plazo, renovacionAutomatica } = req.body;
  const usuarioId = req.usuarioId; // viene del middleware auth

  try {
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + Number(plazo));

    const nuevoCDT = new CDT({
      usuarioId,
      monto,
      fechaVencimiento,
      renovacionAutomatica
    });

    await nuevoCDT.save();
    res.status(201).json({ message: 'Solicitud de apertura de CDT exitosa', cdt: nuevoCDT });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar CDTs del usuario
exports.listarCDTs = async (req, res) => {
  const usuarioId = req.usuarioId;

  try {
    const cdts = await CDT.find({ usuarioId });
    res.json(cdts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Renovación automática
exports.renovarCDT = async (req, res) => {
  const { idCDT } = req.params;

  try {
    const cdt = await CDT.findById(idCDT);
    if (!cdt) return res.status(404).json({ error: "CDT no encontrado" });

    const nuevaFechaVencimiento = new Date(cdt.fechaVencimiento);
    nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + 30); // +30 días

    const nuevoCDT = new CDT({
      usuarioId: cdt.usuarioId,
      monto: cdt.monto,
      fechaVencimiento: nuevaFechaVencimiento,
      renovacionAutomatica: cdt.renovacionAutomatica
    });

    await nuevoCDT.save();
    res.json({ message: 'CDT renovado automáticamente', cdt: nuevoCDT });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

