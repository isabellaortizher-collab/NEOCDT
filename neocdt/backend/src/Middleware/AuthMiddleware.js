// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const header = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
    if (!header) return res.status(401).json({ error: 'Token no proporcionado' });

    const parts = header.split(' ');
    const token = parts.length === 2 ? parts[1] : header;

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'testsecret');
    req.usuarioId = payload.userId;
    req.userRole = payload.rol;
    return next();
  } catch (err) {
    return res.status(401).json({ error: err.message || 'Token inválido' });
  }
};
