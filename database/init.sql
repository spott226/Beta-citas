PRAGMA foreign_keys = ON;

-- =========================
-- Usuarios administrador
-- =========================
CREATE TABLE IF NOT EXISTS users (
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
-- Servicios del spa
-- =========================
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  duration_minutes INTEGER NOT NULL
);

-- =========================
-- Relación empleados ↔ servicios
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

  google_event_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (employee_id) REFERENCES empleados(id)
);

-- =========================
-- Servicios iniciales
-- =========================
INSERT OR IGNORE INTO services (name, duration_minutes) VALUES
  ('Masaje relajante', 60),
  ('Facial premium', 90),
  ('Ritual spa completo', 120);
