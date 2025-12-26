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

// 🔹 Abrir base de datos
const db = new Database(dbPath);

// 🔹 Ejecutar init.sql SOLO si la DB está vacía
const hasTables = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' LIMIT 1"
  )
  .get();

if (!hasTables) {
  console.log('🛠 Inicializando base de datos...');
  const initSQL = fs.readFileSync(
    path.join(__dirname, '../database/init.sql'),
    'utf8'
  );
  db.exec(initSQL);
}

module.exports = db;
