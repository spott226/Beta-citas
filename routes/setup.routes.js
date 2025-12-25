const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 🔹 Estado del sistema
router.get('/status', (req, res) => {
  const services = db.prepare('SELECT COUNT(*) AS count FROM services').get().count;
  const employees = db.prepare('SELECT COUNT(*) AS count FROM employees').get().count;
  const relations = db.prepare('SELECT COUNT(*) AS count FROM employee_services').get().count;

  const ready = services > 0 && employees > 0 && relations > 0;

  res.json({
    services,
    employees,
    relations,
    ready
  });
});

module.exports = router;
