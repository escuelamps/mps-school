import { google } from 'googleapis';

// Credenciales que el administrador pondrá en .env.local
const CREDENTIALS = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

export const getCalendarAuth = () => {
  if (!CREDENTIALS.client_email || !CREDENTIALS.private_key) {
    console.warn('Faltan credenciales de Google Calendar en .env.local');
    return null;
  }

  const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    ['https://www.googleapis.com/auth/calendar']
  );

  return google.calendar({ version: 'v3', auth });
};

export const getAvailability = async (calendarId, timeMin, timeMax) => {
  const calendar = getCalendarAuth();
  if (!calendar) return null;

  try {
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(timeMin).toISOString(),
        timeMax: new Date(timeMax).toISOString(),
        items: [{ id: calendarId }],
      }
    });
    
    return response.data.calendars[calendarId].busy;
  } catch (error) {
    console.error('Error fetching availability:', error);
    return null;
  }
};

export const createBooking = async (calendarId, eventDetails) => {
  const calendar = getCalendarAuth();
  if (!calendar) return null;

  try {
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: eventDetails.summary,
        description: eventDetails.description,
        start: {
          dateTime: new Date(eventDetails.start).toISOString(),
          timeZone: 'America/Bogota', // Ajustar según zona horaria
        },
        end: {
          dateTime: new Date(eventDetails.end).toISOString(),
          timeZone: 'America/Bogota',
        },
        attendees: [
          { email: eventDetails.studentEmail }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 },
          ],
        },
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    return null;
  }
};
