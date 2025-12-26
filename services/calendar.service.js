const { google } = require('googleapis');

if (
  !process.env.GOOGLE_CLIENT_EMAIL ||
  !process.env.GOOGLE_PRIVATE_KEY_BASE64 ||
  !process.env.GOOGLE_CALENDAR_ID
) {
  throw new Error('❌ Faltan variables de entorno de Google Calendar');
}

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  Buffer.from(
    process.env.GOOGLE_PRIVATE_KEY_BASE64,
    'base64'
  ).toString('utf8'),
  ['https://www.googleapis.com/auth/calendar']
);

const calendar = google.calendar({
  version: 'v3',
  auth,
});

async function createEvent({ summary, description, start, end }) {
  const res = await calendar.events.insert({
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

  return res.data;
}

module.exports = { createEvent };
