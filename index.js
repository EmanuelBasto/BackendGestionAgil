// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const perfilRoutes = require('./routes/perfil');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true
}));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);

// Archivos estáticos (frontend en /public)
app.use(express.static(path.join(__dirname, '../public')));

// Redirigir /reset-password → reset-password.html
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/reset-password.html'));
});

// Si quieres que /login también funcione:
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

