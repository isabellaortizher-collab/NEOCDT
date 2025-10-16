const Usuario = require('../Models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nombreUsuario, nombreCompleto, correo, contrasena } = req.body;

  try {
    const existeUsuario = await Usuario.findOne({ correo });
    if (existeUsuario) return res.status(400).json({ error: "Correo ya registrado" });

    const nuevoUsuario = new Usuario({ nombreUsuario, nombreCompleto, correo, contrasena });
    await nuevoUsuario.save();

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (err) {
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
      { userId: user._id, rol: user.rol, nombreUsuario: user.nombreUsuario },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ 
      token, 
      rol: user.rol, 
      nombreUsuario: user.nombreUsuario 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

