require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const perfilRoutes = require('./routes/perfil');

const app = express();

// Orígenes permitidos (añade los que necesites)
const allowedOrigins = [
  'http://127.0.0.1:8081',
  'http://localhost:3000'
];

// Middleware CORS personalizado usando el paquete cors
const corsOptions = {
  origin: function(origin, callback) {
    // origin === undefined cuando la petición viene desde herramientas (Postman, curl)
    if (!origin) {
      // permitir peticiones sin Origin (útil para testing)
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      // permitir este origin concreto
      return callback(null, true);
    }
    // denegar el origin (no pasar error, solo posición false)
    return callback(null, false);
  },
  credentials: true, // permitir cookies/sesiones si las usas
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Primero registrar el middleware CORS
app.use((req, res, next) => {
  // Registrar el origin entrante para debug
  const origin = req.get('Origin');
  if (origin) console.log('[CORS] Origin recibido:', origin);
  next();
});

app.use(cors(corsOptions));

// Asegurar que respondemos correctamente a preflight OPTIONS
app.options('*', (req, res) => {
  const origin = req.get('Origin');
  // Si el origin está permitido, dejar que cors() lo atienda — extra header ya agregado por cors()
  if (!origin) return res.sendStatus(204); // sin Origin: responder OK vacio
  if (allowedOrigins.includes(origin)) {
    // cors ya colocó los headers adecuados; respondemos 204 No Content
    return res.sendStatus(204);
  }
  // Origin no permitido: 403 para indicar rechazo explícito en preflight
  return res.status(403).json({ ok: false, message: 'Origin no permitido por CORS' });
});

// Middleware para body JSON
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🚀');
});

// Manejo básico de errores (opcional pero útil)
app.use((err, req, res, next) => {
  console.error('[ERROR]', err && err.message ? err.message : err);
  res.status(err.status || 500).json({ ok: false, message: err.message || 'Error del servidor' });
});

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


