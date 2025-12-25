const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/database');

// 🔹 CREAR ADMIN INICIAL (USAR SOLO UNA VEZ)
router.get('/init-admin', async (req, res) => {
  const adminExists = db
    .prepare('SELECT id FROM admins LIMIT 1')
    .get();

  if (adminExists) {
    return res.json({
      success: false,
      message: 'Admin ya existe'
    });
  }

  const username = 'admin';
  const password = 'admin123'; // ← luego la cambias desde código o DB
  const hash = await bcrypt.hash(password, 10);

  db.prepare(`
    INSERT INTO admins (username, password)
    VALUES (?, ?)
  `).run(username, hash);

  res.json({
    success: true,
    message: 'Admin creado',
    username,
    password
  });
});

module.exports = router;
