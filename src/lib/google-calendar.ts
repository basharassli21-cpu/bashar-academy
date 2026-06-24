import "server-only";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

async function getAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  return data.access_token as string;
}

export async function createCalendarEvent(params: {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendeeEmail?: string;
}) {
  const token = await getAccessToken();

  const event = {
    summary: params.summary,
    description: params.description,
    start: {
      dateTime: params.startTime,
      timeZone: "Asia/Amman",
    },
    end: {
      dateTime: params.endTime,
      timeZone: "Asia/Amman",
    },
    ...(params.attendeeEmail && {
      attendees: [{ email: params.attendeeEmail }],
    }),
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${process.env.GOOGLE_CALENDAR_ID}/events?conferenceDataVersion=1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  return response.json() as Promise<{
    id: string;
    hangoutLink?: string;
    htmlLink?: string;
  }>;
}

export async function updateCalendarEvent(eventId: string, params: {
  summary?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}) {
  const token = await getAccessToken();

  const body: Record<string, unknown> = {};
  if (params.summary) body.summary = params.summary;
  if (params.description) body.description = params.description;
  if (params.startTime) {
    body.start = { dateTime: params.startTime, timeZone: "Asia/Amman" };
  }
  if (params.endTime) {
    body.end = { dateTime: params.endTime, timeZone: "Asia/Amman" };
  }

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${process.env.GOOGLE_CALENDAR_ID}/events/${eventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  return response.json();
}

export async function deleteCalendarEvent(eventId: string) {
  const token = await getAccessToken();

  await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${process.env.GOOGLE_CALENDAR_ID}/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
