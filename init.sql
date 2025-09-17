-- ============================
-- DROP tablas si existen
-- ============================
DROP TABLE IF EXISTS tokens_reset CASCADE;
DROP TABLE IF EXISTS valoraciones CASCADE;
DROP TABLE IF EXISTS sesiones CASCADE;
DROP TABLE IF EXISTS bloqueos CASCADE;
DROP TABLE IF EXISTS disponibilidades CASCADE;
DROP TABLE IF EXISTS tutor_materia CASCADE;
DROP TABLE IF EXISTS materias CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS carreras CASCADE;
DROP TABLE IF EXISTS niveles CASCADE;
DROP TABLE IF EXISTS motivos_cancelacion CASCADE;
DROP TABLE IF EXISTS estados_sesion CASCADE;
DROP TABLE IF EXISTS modalidades CASCADE;
DROP TABLE IF EXISTS estados_materia CASCADE;
DROP TABLE IF EXISTS estados_usuario CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================
-- CATÁLOGOS
-- ============================
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE estados_usuario (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE estados_materia (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE modalidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE estados_sesion (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE motivos_cancelacion (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE niveles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE carreras (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) UNIQUE NOT NULL
);

-- ============================
-- Tablas principales
-- ============================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  matricula VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol_id INTEGER REFERENCES roles(id),
  estado_id INTEGER REFERENCES estados_usuario(id),
  telefono VARCHAR(30),
  foto_url TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE materias (
  id SERIAL PRIMARY KEY,
  clave VARCHAR(50) UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  carrera_id INTEGER REFERENCES carreras(id),
  estado_id INTEGER REFERENCES estados_materia(id)
);

CREATE TABLE tutor_materia (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  nivel_id INTEGER REFERENCES niveles(id)
);

CREATE TABLE disponibilidades (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dia_semana SMALLINT CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  recurrente BOOL DEFAULT TRUE
);

CREATE TABLE bloqueos (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  motivo TEXT
);

CREATE TABLE sesiones (
  id SERIAL PRIMARY KEY,
  estudiante_id INTEGER NOT NULL REFERENCES users(id),
  tutor_id INTEGER NOT NULL REFERENCES users(id),
  materia_id INTEGER NOT NULL REFERENCES materias(id),
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  modalidad_id INTEGER REFERENCES modalidades(id),
  ubicacion_o_enlace TEXT,
  estado_id INTEGER REFERENCES estados_sesion(id),
  motivo_cancelacion_id INTEGER REFERENCES motivos_cancelacion(id),
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE valoraciones (
  id SERIAL PRIMARY KEY,
  sesion_id INTEGER NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
  estrellas SMALLINT CHECK (estrellas BETWEEN 1 AND 5),
  comentario TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tokens_reset (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expiracion TIMESTAMP NOT NULL,
  usado BOOL DEFAULT FALSE
);

-- ============================
-- POBLAR catálogos (valores iniciales)
-- ============================
INSERT INTO roles (nombre) VALUES ('estudiante'), ('tutor'), ('admin');
INSERT INTO estados_usuario (nombre) VALUES ('pendiente'), ('activo'), ('inactivo');
INSERT INTO estados_materia (nombre) VALUES ('activo'), ('inactivo');
INSERT INTO modalidades (nombre) VALUES ('presencial'), ('online');
INSERT INTO estados_sesion (nombre) VALUES ('pendiente'), ('confirmada'), ('reprogramada'), ('cancelada'), ('realizada');
INSERT INTO motivos_cancelacion (nombre) VALUES ('conflicto de horario'), ('enfermedad'), ('motivos personales'), ('falla técnica'), ('otro');
INSERT INTO niveles (nombre) VALUES ('básico'), ('intermedio'), ('avanzado');
INSERT INTO carreras (nombre) VALUES
  ('Ingeniería en Sistemas'),
  ('Ingeniería Industrial'),
  ('Administración de Empresas'),
  ('Derecho'),
  ('Medicina'),
  ('Arquitectura');
