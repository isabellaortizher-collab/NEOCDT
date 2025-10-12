const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
  nombreUsuario: { type: String, required: true, unique: true },
  nombreCompleto: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true }, // aquí guardaremos el hash
  numeroDocumento: { type: String },
  tipoDocumento: { type: String, enum: ['CC', 'TI', 'RC', 'CE'], default: 'CC' },
  rol: { type: String, enum: ['Cliente','Agente','Admin'], default: 'Cliente' },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now },
  fechaUltimoIngreso: { type: Date }
});

UsuarioSchema.pre('save', function(next){
  this.fechaActualizacion = new Date();
  next();
});

module.exports = mongoose.model('Usuario', UsuarioSchema);