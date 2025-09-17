// routes/perfil.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, async (req, res) => {
  const id = req.user.id;
  try {
    const r = await db.query(
      `SELECT u.id, u.matricula, u.email, u.nombre, u.apellido, r.nombre AS role, u.telefono, u.foto_url
       FROM users u
       LEFT JOIN roles r ON u.rol_id = r.id
       WHERE u.id=$1 LIMIT 1`, [id]);

    if (r.rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error servidor' });
  }
});

module.exports = router;

