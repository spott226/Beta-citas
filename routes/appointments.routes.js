const express = require('express');
const router = express.Router();
const db = require('../config/database');
const calendarService = require('../services/calendar.service');

// ===============================
// Helper: fecha SQL LOCAL (MX)
// ===============================
function toLocalSQLDate(date) {
  const pad = n => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

// ===============================
// CREAR CITA
// ===============================
router.post('/', async (req, res) => {
  const {
    name,
    phone,
    email,
    service_id,
    employee_id,
    start_datetime
  } = req.body;

  if (!name || !phone || !service_id || !employee_id || !start_datetime) {
    return res.status(400).json({ error: 'Campos obligatorios faltantes' });
  }

  try {
    // Servicio
    const service = db.prepare(`
      SELECT name, duration_minutes
      FROM services
      WHERE id = ?
    `).get(service_id);

    if (!service) {
      return res.status(400).json({ error: 'Servicio no válido' });
    }

    // Fechas locales MX
    const start = new Date(start_datetime);
    const end = new Date(start.getTime() + service.duration_minutes * 60000);

    const startSQL = toLocalSQLDate(start);
    const endSQL   = toLocalSQLDate(end);

    // Empalme SOLO citas activas
    const conflict = db.prepare(`
      SELECT id FROM appointments
      WHERE employee_id = ?
        AND status = 'confirmed'
        AND start_datetime < ?
        AND end_datetime > ?
    `).get(employee_id, endSQL, startSQL);

    if (conflict) {
      return res.status(409).json({ error: 'Horario no disponible' });
    }

    // Google Calendar (Luxon vive en el service)
    const event = await calendarService.createEvent({
      summary: service.name,
      description: `Cliente: ${name}\nTel: ${phone}\nEmail: ${email || ''}`,
      start: startSQL,
      end: endSQL,
    });

    // Guardar cita (STATUS ONLY)
    db.prepare(`
      INSERT INTO appointments (
        name,
        phone,
        email,
        service_id,
        employee_id,
        start_datetime,
        end_datetime,
        google_event_id,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `).run(
      name,
      phone,
      email || null,
      service_id,
      employee_id,
      startSQL,
      endSQL,
      event.id
    );

    res.json({ success: true });

  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({ error: 'Error creando la cita' });
  }
});

module.exports = router;
