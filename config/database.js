const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 🔹 Directorio de la DB (PRODUCCIÓN SAFE)
const dbDir = path.join(__dirname, '../database');
const dbPath = path.join(dbDir, 'app.db');

// 🧨 RESET TEMPORAL DE DB (SOLO UNA VEZ)
if (process.env.RESET_DB === 'true' && fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🧨 Base de datos eliminada por RESET_DB');
}

// 🔹 Crear carpeta si no existe (CLAVE)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 🔹 Crear archivo DB si no existe
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
}

// 🔹 Abrir base de datos
const db = new Database(dbPath);

// 🔹 Ejecutar init.sql
const initSQL = fs.readFileSync(
  path.join(__dirname, '../database/init.sql'),
  'utf8'
);

db.exec(initSQL);

module.exports = db;
