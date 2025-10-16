const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CDTSchema = new Schema({
  usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  monto: { type: Number, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaVencimiento: { type: Date, required: true },
  estado: { type: String, enum: ['Pendiente', 'Aprobado', 'Rechazado', 'Cancelado'], default: 'Pendiente' },
  renovacionAutomatica: { type: Boolean, default: false }
});

module.exports = mongoose.models.CDT || mongoose.model('CDT', CDTSchema);
