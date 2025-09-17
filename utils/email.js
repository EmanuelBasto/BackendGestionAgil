// utils/email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

// Transporter global (con SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true si usas puerto 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 📩 Función genérica para enviar emails
async function sendEmail(to, subject, html) {
  console.log('📧 Simulación de envío de correo');
  console.log('Para:', to);
  console.log('Asunto:', subject);
  console.log('Contenido HTML:\n', html);
}


// 📩 Función específica para reset de contraseña
async function sendResetEmail(toEmail, token) {
  const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  const html = `
    <p>Ingresa al siguiente enlace para recuperar tu contraseña:</p>
    <p><a href="${link}">${link}</a></p>
  `;

  return sendEmail(toEmail, 'Recuperación de contraseña', html);
}

module.exports = { sendEmail, sendResetEmail };
