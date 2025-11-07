// controllers/cdtController.js
const CDT = require('../Models/CDT');
const Usuario = require('../Models/Usuario');
const ContenidoCDT = require('../Models/ContenidoCDT');

// Crear un nuevo CDT
exports.crearCDT = async (req, res) => {
  const { descripcion, contenido } = req.body;
  const usuarioId = req.user.userId; // viene del middleware auth

  try {
    if (!descripcion || descripcion.trim() === '') {
      return res.status(400).json({ error: 'descripcion requerida' });
    }
    if (!contenido) {
      return res.status(400).json({ error: 'contenido requerido' });
    }
    if (!contenido.montoPrincipal) {
      return res.status(400).json({ error: 'montoPrincipal requerido' });
    }
    if (!contenido.tasaInteres) {
      return res.status(400).json({ error: 'tasaInteres requerido' });
    }
    if (!contenido.plazoMeses) {
      return res.status(400).json({ error: 'plazoMeses requerido' });
    }

    const nuevoCDT = new CDT({
      usuarioId,
      descripcion,
      contenido
    });

    await nuevoCDT.save();
    res.status(201).json({ message: 'Solicitud de apertura de CDT exitosa', cdt: nuevoCDT });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
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

// Actualizar contenido del CDT
exports.actualizarContenido = async (req, res) => {
  const { idCDT } = req.params;
  const { tipoSolicitud, estado, montoPrincipal, tasaInteres, plazoMeses } = req.body;

  try {
    const cdt = await CDT.findById(idCDT);
    if (!cdt) return res.status(404).json({ error: 'CDT no encontrado' });

    const nuevoContenido = new ContenidoCDT({
      idCDT,
      tipoSolicitud: tipoSolicitud || 'apertura',
      estado: estado || 'borrador',
      montoPrincipal,
      tasaInteres,
      plazoMeses
    });

    await nuevoContenido.save();
    res.status(201).json({ message: 'Contenido actualizado', contenido: nuevoContenido });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Obtener historial de contenido del CDT
exports.getHistorial = async (req, res) => {
  const { idCDT } = req.params;

  try {
    const historial = await ContenidoCDT.find({ idCDT }).sort({ fechaCreacion: 1 });
    res.json(historial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

