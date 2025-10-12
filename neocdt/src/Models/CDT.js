const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CDTSchema = new Schema({
  usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaActualizacion: { type: Date, default: Date.now },
  descripcion: { type: String },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CDT', CDTSchema);