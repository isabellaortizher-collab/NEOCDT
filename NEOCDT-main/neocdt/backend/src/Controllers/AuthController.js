const Usuario = require('../Models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nombreUsuario, nombreCompleto, correo, contrasena, numeroDocumento, tipoDocumento } = req.body;
  try {
    // Verificar si el usuario ya existe por correo o nombre de usuario
    const existing = await Usuario.findOne({ $or: [{ correo }, { nombreUsuario }] });
    if (existing) return res.status(400).json({ error: 'Usuario ya existe' });

    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);

    // Crear nuevo usuario
    const user = new Usuario({
      nombreUsuario,
      nombreCompleto,
      correo,
      contrasena: hash,
      numeroDocumento,
      tipoDocumento
    });

    // Guardar usuario si es una instancia válida
    if (user && typeof user.save === 'function') {
      await user.save();
    }

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    // Buscar usuario por correo
    const user = await Usuario.findOne({ correo });
    if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });

    // Verificar contraseña
    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) return res.status(400).json({ error: 'Credenciales inválidas' });

    // Actualizar fecha de último ingreso si es una instancia válida
    if (user && typeof user.save === 'function') {
      user.fechaUltimoIngreso = new Date();
      await user.save();
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, rol: user.rol },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '8h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

