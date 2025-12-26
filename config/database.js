const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 🔹 Directorio de la DB (Render SAFE)
const dbDir = path.join(process.cwd(), 'database');
const dbPath = path.join(dbDir, 'app.db');

// 🔹 Crear carpeta si no existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 🧨 RESET CONTROLADO (SOLO SI RESET_DB=true)
if (process.env.RESET_DB === 'true' && fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🧨 Base de datos eliminada por RESET_DB');
}

// 🔹 Abrir base de datos
const db = new Database(dbPath);

// 🔹 Ejecutar init.sql SI NO EXISTEN LAS TABLAS CLAVE
const requiredTables = [
  'administradores',
  'empleados',
  'clientes',
  'services',
  'appointments'
];

const existingTables = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table'"
  )
  .all()
  .map(t => t.name);

const missingTables = requiredTables.filter(
  t => !existingTables.includes(t)
);

if (missingTables.length) {
  console.log('🛠 Inicializando base de datos:', missingTables);
  const initSQL = fs.readFileSync(
    path.join(__dirname, '../database/init.sql'),
    'utf8'
  );
  db.exec(initSQL);
}

module.exports = db;
