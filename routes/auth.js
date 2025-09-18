const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

// ----------------- Registro -----------------
router.post('/register', async (req, res) => {
  try {
    const { nombre_completo, matricula, email, password, rol, estado } = req.body;

    if (!nombre_completo || !email || !password || !matricula || !rol || !estado) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    // Obtener IDs de rol y estado
    const rolQ = await db.query('SELECT id FROM roles WHERE nombre = $1', [rol]);
    if (rolQ.rows.length === 0) return res.status(400).json({ message: 'Rol inválido' });
    const rol_id = rolQ.rows[0].id;

    const estadoQ = await db.query('SELECT id FROM estados_usuario WHERE nombre = $1', [estado]);
    if (estadoQ.rows.length === 0) return res.status(400).json({ message: 'Estado inválido' });
    const estado_id = estadoQ.rows[0].id;

    // Insertar usuario
    const result = await db.query(
      `INSERT INTO users (matricula, email, nombre_completo, password, rol_id, estado_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, email, nombre_completo, rol_id`,
      [matricula, email, nombre_completo, password, rol_id, estado_id]
    );

    return res.status(201).json({ message: 'Usuario creado', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ----------------- Login -----------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Correo no registrado' });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    return res.status(200).json({
      message: 'Login exitoso',
      usuario: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        email: user.email,
        matricula: user.matricula,
        rol_id: user.rol_id
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ----------------- Forgot password -----------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ message: 'Se requiere correo o matrícula' });

    const userQ = await db.query(
      `SELECT id, email FROM users WHERE email=$1 OR matricula=$1`,
      [identifier]
    );
    if (userQ.rows.length === 0) {
      return res.status(200).json({ message: 'Si la cuenta existe se ha enviado un enlace al correo.' });
    }

    const user = userQ.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)`,
      [user.id, tokenHash, expiresAt]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
    const resetLink = `${frontendUrl}/reset-password.html?token=${token}`;

    const html = `
      <p>Hola,</p>
      <p>Haz solicitado restablecer tu contraseña. Haz clic en el enlace para crear una nueva contraseña (válido 1 hora):</p>
      <p><a href="${resetLink}">Restablecer contraseña</a></p>
      <p>Si no solicitaste esto, ignora este correo.</p>
    `;

    await sendEmail(user.email, 'Restablecer contraseña', html);

    return res.status(200).json({ message: 'Si la cuenta existe, se ha enviado un enlace por correo.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno' });
  }
});

// ----------------- Reset password -----------------
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token y contraseña son requeridos' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const tokenQ = await db.query(
      `SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token_hash=$1`,
      [tokenHash]
    );
    if (tokenQ.rows.length === 0) return res.status(400).json({ message: 'Token inválido' });

    const tokenRow = tokenQ.rows[0];
    if (tokenRow.used) return res.status(400).json({ message: 'Token ya usado' });
    if (new Date(tokenRow.expires_at) < new Date()) return res.status(400).json({ message: 'Token expirado' });

    await db.query(`UPDATE users SET password = $1 WHERE id = $2`, [password, tokenRow.user_id]);
    await db.query(`UPDATE password_reset_tokens SET used=true WHERE id=$1`, [tokenRow.id]);

    return res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;

