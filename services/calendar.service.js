const { google } = require('googleapis');
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// Alcances de Google Calendar
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Autenticación con Service Account
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: SCOPES,
});

// Cliente de Google Calendar
const calendar = google.calendar({
  version: 'v3',
  auth,
});

// ======================================================
// 📅 CREAR EVENTO
// ======================================================
async function createEvent({ summary, description, start, end }) {
  const response = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary,
      description,
      start: {
        dateTime: start,
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: end,
        timeZone: 'America/Mexico_City',
      },
    },
  });

  return response.data;
}

// ======================================================
// ❌ ELIMINAR EVENTO (CANCELAR CITA)
// ======================================================
async function deleteEvent(eventId) {
  await calendar.events.delete({
    calendarId: CALENDAR_ID,
    eventId,
  });
}

// ======================================================
// 🔁 ACTUALIZAR EVENTO (REAGENDAR CITA)
// ======================================================
async function updateEvent(eventId, start, end) {
  await calendar.events.patch({
    calendarId: CALENDAR_ID,
    eventId,
    requestBody: {
      start: {
        dateTime: start,
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: end,
        timeZone: 'America/Mexico_City',
      },
    },
  });
}

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
  createEvent,
  deleteEvent,
  updateEvent,
};
