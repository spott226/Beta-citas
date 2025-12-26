const { google } = require('googleapis');

if (
  !process.env.GOOGLE_CLIENT_EMAIL ||
  !process.env.GOOGLE_PRIVATE_KEY ||
  !process.env.GOOGLE_CALENDAR_ID
) {
  throw new Error('❌ Faltan variables de entorno de Google Calendar');
}

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/calendar']
);

// 🔑 AUTORIZACIÓN EXPLÍCITA (CLAVE)
auth.authorize();

const calendar = google.calendar({
  version: 'v3',
  auth,
});

// ======================================================
// 📅 CREAR EVENTO
// ======================================================
async function createEvent({ summary, description, start, end }) {
  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
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

async function deleteEvent(eventId) {
  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId,
  });
}

async function updateEvent(eventId, start, end) {
  const response = await calendar.events.patch({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
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

  return response.data;
}

module.exports = {
  createEvent,
  deleteEvent,
  updateEvent,
};
