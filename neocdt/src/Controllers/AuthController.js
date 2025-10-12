const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nombreUsuario, nombreCompleto, correo, contrasena, numeroDocumento, tipoDocumento } = req.body;
  try {
    const existing = await Usuario.findOne({ $or: [{ correo }, { nombreUsuario }] });
    if (existing) return res.status(400).json({ error: 'Usuario ya existe' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);

    const user = new Usuario({
      nombreUsuario, nombreCompleto, correo,
      contrasena: hash, numeroDocumento, tipoDocumento
    });
    await user.save();
    res.status(201).json({ message: 'Registrado' });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    const user = await Usuario.findOne({ correo });
    if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });

    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) return res.status(400).json({ error: 'Credenciales inválidas' });

    user.fechaUltimoIngreso = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({ error: err.message });
  }
};
