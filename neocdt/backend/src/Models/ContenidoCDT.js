const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Decimal128 = Schema.Types.Decimal128;

const ContenidoCDTSchema = new Schema({
  idCDT:         { type: Schema.Types.ObjectId, ref: 'CDT', required: true },
  tipoSolicitud: { type: String, enum: ['apertura','renovacion','cancelacion'], default: 'apertura' },
  estado:        { type: String, enum: ['borrador','en_validacion','aprobada','rechazada','cancelada'], default: 'borrador' },
  montoPrincipal:{ type: Decimal128, required: true },
  montoGanancia: { type: Decimal128 },
  tasaInteres:   { type: Decimal128, required: true },
  plazoMeses:    { type: Number, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaVencimiento:{ type: Date },
  canal:         { type: String, enum: ['web','app','agente'], default: 'web' }
});

module.exports = mongoose.model('ContenidoCDT', ContenidoCDTSchema);
