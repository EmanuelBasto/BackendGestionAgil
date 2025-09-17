// middleware/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'No autorizado' });
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Token malformado' });
  const token = parts[1];
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data; // data tendrá { id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = authMiddleware;
