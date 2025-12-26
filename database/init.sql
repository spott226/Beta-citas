PRAGMA foreign_keys = ON;

-- =========================
-- Administradores
-- =========================
CREATE TABLE IF NOT EXISTS administradores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

-- =========================
-- Empleados
-- =========================
CREATE TABLE IF NOT EXISTS empleados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  active INTEGER DEFAULT 1
);

-- =========================
-- Clientes
-- =========================
CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT
);

-- =========================
-- Servicios
-- =========================
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL
);

-- =========================
-- Empleados ↔ Servicios
-- =========================
CREATE TABLE IF NOT EXISTS employee_services (
  employee_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  PRIMARY KEY (employee_id, service_id),
  FOREIGN KEY (employee_id) REFERENCES empleados(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- =========================
-- Citas
-- =========================
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,

  service_id INTEGER NOT NULL,
  employee_id INTEGER,

  start_datetime TEXT NOT NULL,
  end_datetime TEXT NOT NULL,

  google_event_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (employee_id) REFERENCES empleados(id)
);

-- =========================
-- Servicios iniciales
-- =========================
INSERT OR IGNORE INTO services (name, description, duration_minutes) VALUES
  ('Masaje relajante', 'Masaje corporal completo', 60),
  ('Facial premium', 'Tratamiento facial avanzado', 90),
  ('Ritual spa completo', 'Experiencia integral de spa', 120);
