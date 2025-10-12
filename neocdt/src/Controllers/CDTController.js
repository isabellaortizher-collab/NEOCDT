const CDT = require('../models/CDT');
const ContenidoCDT = require('../models/ContenidoCDT');
const { toDecimal128 } = require('../Utils/Decimal');

function validarContenidoMinimo(contenido) {
  if (!contenido) return 'contenido requerido';
  if (!contenido.montoPrincipal) return 'montoPrincipal requerido';
  if (!contenido.tasaInteres) return 'tasaInteres requerido';
  if (contenido.plazoMeses == null) return 'plazoMeses requerido';
  return null;
}

exports.crearCDT = async (req, res) => {
  try {
    const { descripcion, contenido } = req.body;

    if (!descripcion || String(descripcion).trim() === '') {
      return res.status(400).json({ error: 'descripcion requerida' });
    }

    const faltante = validarContenidoMinimo(contenido);
    if (faltante) return res.status(400).json({ error: faltante });

    const cdt = new CDT({ usuarioId: req.user.userId, descripcion });
    await cdt.save();

    const nuevoContenidoObj = { ...contenido, idCDT: cdt._id };
    if (nuevoContenidoObj.montoPrincipal)
      nuevoContenidoObj.montoPrincipal = toDecimal128(nuevoContenidoObj.montoPrincipal);
    if (nuevoContenidoObj.tasaInteres)
      nuevoContenidoObj.tasaInteres = toDecimal128(nuevoContenidoObj.tasaInteres);

    const nuevoContenido = new ContenidoCDT(nuevoContenidoObj);
    await nuevoContenido.save();

    res.status(201).json({ cdt, contenido: nuevoContenido });
  } catch (err) {
    if (err.name === 'ValidationError')
      return res.status(400).json({ error: err.message });
    /* istanbul ignore next */
    console.error('Error al crear CDT:', err);
    /* istanbul ignore next */
    res.status(500).json({ error: 'error interno' });
  }
};

exports.listarCDTs = async (req, res) => {
  try {
    const cdts = await CDT.find({ usuarioId: req.user.userId }).sort({ fechaCreacion: -1 });
    res.json(cdts);
  } catch (err) {
    /* istanbul ignore next */
    console.error('Error al listar CDTs:', err);
    /* istanbul ignore next */
    res.status(500).json({ error: 'error interno' });
  }
};

exports.actualizarContenido = async (req, res) => {
  try {
    const { idCDT } = req.params;
    const cambios = req.body;

    const cdtExistente = await CDT.findById(idCDT);
    if (!cdtExistente) {
      return res.status(404).json({ error: 'CDT no encontrado' });
    }

    const faltante = validarContenidoMinimo(cambios);
    if (faltante) return res.status(400).json({ error: faltante });

    const nuevoContenidoObj = { ...cambios, idCDT };
    if (nuevoContenidoObj.montoPrincipal)
      nuevoContenidoObj.montoPrincipal = toDecimal128(nuevoContenidoObj.montoPrincipal);
    if (nuevoContenidoObj.tasaInteres)
      nuevoContenidoObj.tasaInteres = toDecimal128(nuevoContenidoObj.tasaInteres);

    const nuevoContenido = new ContenidoCDT(nuevoContenidoObj);
    await nuevoContenido.save();

    await CDT.findByIdAndUpdate(idCDT, { fechaActualizacion: new Date() });

    res.status(201).json(nuevoContenido);
  } catch (err) {
    if (err.name === 'ValidationError')
      return res.status(400).json({ error: err.message });
    /* istanbul ignore next */
    console.error('Error al actualizar contenido:', err);
    /* istanbul ignore next */
    res.status(500).json({ error: 'error interno' });
  }
};

exports.historial = async (req, res) => {
  try {
    const { idCDT } = req.params;
    const historial = await ContenidoCDT.find({ idCDT }).sort({ fechaCreacion: 1 });
    res.json(historial);
  } catch (err) {
    /* istanbul ignore next */
    console.error('Error al obtener historial:', err);
    /* istanbul ignore next */
    res.status(500).json({ error: 'error interno' });
  }
};

