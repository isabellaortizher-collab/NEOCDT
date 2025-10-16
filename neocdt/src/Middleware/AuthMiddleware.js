// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No autorizado' });

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.userId; // así coincide con el controlador
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
