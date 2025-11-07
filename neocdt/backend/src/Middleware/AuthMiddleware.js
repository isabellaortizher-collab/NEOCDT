// Middleware de autenticación
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Obtener el token del header de autorización
    const header = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
    if (!header) return res.status(401).json({ error: 'Token no proporcionado' });

    // Extraer el token (soporta Bearer token)
    const parts = header.split(' ');
    const token = parts.length === 2 ? parts[1] : header;

    // Verificar y decodificar el token
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'testsecret');
    req.usuarioId = payload.userId;
    req.userRole = payload.rol;
    req.user = { userId: payload.userId }; // Para compatibilidad con controladores
    return next();
  } catch (err) {
    return res.status(401).json({ error: err.message || 'Token inválido' });
  }
};
