const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/database');

// 🔹 CREAR ADMIN INICIAL (USAR SOLO UNA VEZ)
router.get('/init-admin', async (req, res) => {
  try {
    // 🔹 Asegurar que la tabla exista (PRODUCCIÓN SAFE)
    db.prepare(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `).run();

    // 🔹 Verificar si ya existe admin
    const adminExists = db
      .prepare('SELECT id FROM admins LIMIT 1')
      .get();

    if (adminExists) {
      return res.status(403).json({
        success: false,
        message: '⚠️ Admin ya existe. Setup bloqueado.'
      });
    }

    // 🔹 Credenciales iniciales
    const username = 'admin';
    const password = 'admin123'; // ⚠️ Cambiar luego
    const hash = await bcrypt.hash(password, 10);

    // 🔹 Insertar admin
    db.prepare(`
      INSERT INTO admins (username, password)
      VALUES (?, ?)
    `).run(username, hash);

    // 🔹 Respuesta clara
    res.json({
      success: true,
      message: '✅ Admin creado correctamente',
      credentials: {
        username,
        password
      }
    });

  } catch (error) {
    console.error('❌ Error en setup admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno creando admin'
    });
  }
});

module.exports = router;
