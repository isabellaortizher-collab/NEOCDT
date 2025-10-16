const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
  nombreUsuario: { type: String, required: true, unique: true },
  nombreCompleto: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true }, 
  numeroDocumento: { type: String },
  tipoDocumento: { type: String, enum: ['CC', 'TI', 'RC', 'CE'], default: 'CC' },
  rol: { type: String, enum: ['Cliente','Agente','Admin'], default: 'Cliente' },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now },
  fechaUltimoIngreso: { type: Date }
});

UsuarioSchema.pre('save', async function(next) {
  this.fechaActualizacion = new Date();

  if (!this.isModified('contrasena')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UsuarioSchema.methods.compararContrasena = async function(contrasenaIngresada) {
  return await bcrypt.compare(contrasenaIngresada, this.contrasena);
};

module.exports = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);
