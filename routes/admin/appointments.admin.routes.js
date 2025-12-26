const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const calendarService = require('../../services/calendar.service');

// ===============================
// Helper fecha SQL LOCAL MX
// ===============================
function toLocalSQLDate(date) {
  const pad = n => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

// ======================================================
// LISTADOS (EXCLUYE CANCELLED)
// ======================================================

router.get('/today', (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, s.name AS service, e.name AS employee
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    LEFT JOIN empleados e ON a.employee_id = e.id
    WHERE date(a.start_datetime) = date('now','localtime')
      AND a.status != 'cancelled'
    ORDER BY a.start_datetime
  `).all();

  res.json(rows);
});

router.get('/week', (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, s.name AS service, e.name AS employee
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    LEFT JOIN empleados e ON a.employee_id = e.id
    WHERE date(a.start_datetime)
      BETWEEN date('now','localtime')
      AND date('now','localtime','+7 days')
      AND a.status != 'cancelled'
    ORDER BY a.start_datetime
  `).all();

  res.json(rows);
});

router.get('/month', (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, s.name AS service, e.name AS employee
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    LEFT JOIN empleados e ON a.employee_id = e.id
    WHERE strftime('%Y-%m', a.start_datetime)
      = strftime('%Y-%m', 'now','localtime')
      AND a.status != 'cancelled'
    ORDER BY a.start_datetime
  `).all();

  res.json(rows);
});

// ======================================================
// CANCELAR
// ======================================================
router.post('/:id/cancel', async (req, res) => {
  const { id } = req.params;

  const appointment = db.prepare(`
    SELECT google_event_id FROM appointments WHERE id = ?
  `).get(id);

  if (!appointment) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }

  try {
    if (appointment.google_event_id) {
      await calendarService.deleteEvent(appointment.google_event_id);
    }

    db.prepare(`
      UPDATE appointments
      SET status = 'cancelled'
      WHERE id = ?
    `).run(id);

    res.json({ success: true });

  } catch (error) {
    console.error('Error cancelando cita:', error);
    res.status(500).json({ error: 'Error cancelando cita' });
  }
});

// ======================================================
// REAGENDAR
// ======================================================
router.post('/:id/reschedule', async (req, res) => {
  const { id } = req.params;
  const { new_start_datetime } = req.body;

  const appointment = db.prepare(`
    SELECT * FROM appointments WHERE id = ?
  `).get(id);

  if (!appointment) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }

  const service = db.prepare(`
    SELECT duration_minutes FROM services WHERE id = ?
  `).get(appointment.service_id);

  const start = new Date(new_start_datetime);
  const end = new Date(start.getTime() + service.duration_minutes * 60000);

  const startSQL = toLocalSQLDate(start);
  const endSQL   = toLocalSQLDate(end);

  const conflict = db.prepare(`
    SELECT id FROM appointments
    WHERE id != ?
      AND employee_id = ?
      AND status = 'confirmed'
      AND start_datetime < ?
      AND end_datetime > ?
  `).get(
    id,
    appointment.employee_id,
    endSQL,
    startSQL
  );

  if (conflict) {
    return res.status(409).json({ error: 'Horario no disponible' });
  }

  await calendarService.updateEvent(
    appointment.google_event_id,
    startSQL,
    endSQL
  );

  db.prepare(`
    UPDATE appointments
    SET start_datetime = ?, end_datetime = ?, status = 'rescheduled'
    WHERE id = ?
  `).run(startSQL, endSQL, id);

  res.json({ success: true });
});

// ======================================================
// ASISTIÓ
// ======================================================
router.post('/:id/confirm', (req, res) => {
  const { id } = req.params;

  const result = db.prepare(`
    UPDATE appointments
    SET status = 'attended', attended = 1
    WHERE id = ?
  `).run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }

  res.json({ success: true });
});

module.exports = router;
