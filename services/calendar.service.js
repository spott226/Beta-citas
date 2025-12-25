import { google } from 'googleapis';

if (
  !process.env.GOOGLE_PROJECT_ID ||
  !process.env.GOOGLE_CLIENT_EMAIL ||
  !process.env.GOOGLE_PRIVATE_KEY
) {
  throw new Error('❌ Faltan variables de entorno de Google');
}

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

export const calendar = google.calendar({
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
