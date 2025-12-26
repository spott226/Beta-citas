const { google } = require('googleapis');

// ===============================
// VALIDACIÓN DE ENV
// ===============================
if (
  !process.env.GOOGLE_CLIENT_EMAIL ||
  !process.env.GOOGLE_PRIVATE_KEY_BASE64 ||
  !process.env.GOOGLE_CALENDAR_ID
) {
  throw new Error('❌ Faltan variables de entorno de Google Calendar');
}

// ===============================
// AUTH JWT
// ===============================
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: Buffer.from(
    process.env.GOOGLE_PRIVATE_KEY_BASE64,
    'base64'
  ).toString('utf8'),
  scopes: ['https://www.googleapis.com/auth/calendar'],
  projectId: process.env.GOOGLE_PROJECT_ID,
});

// ===============================
// CALENDAR CLIENT
// ===============================
const calendar = google.calendar({
  version: 'v3',
  auth,
});

// ===============================
// CREATE EVENT
// ===============================
async function createEvent({ summary, description, start, end }) {
  try {
    // 👉 CONVERSIÓN CORRECTA A ISO
    const startISO = new Date(start).toISOString();
    const endISO   = new Date(end).toISOString();

    const res = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: {
        summary,
        description,
        start: { dateTime: startISO },
        end:   { dateTime: endISO },
      },
    });

    return res.data;

  } catch (error) {
    console.error('❌ Error creando evento en Google Calendar:', error.message);
    throw error;
  }
}

module.exports = { createEvent };
