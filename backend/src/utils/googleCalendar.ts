import { calendar_v3, google } from "googleapis";
import { prisma } from "../config/prisma";
import { getGoogleOAuth2Client } from "./googleClient";
import { NotFoundError } from "./errors";

const CALENDAR_NAME = "Reservas Fotógrafo";

/**
 * Gets the calendar service with authenticated client
 */
async function getCalendarService(): Promise<calendar_v3.Calendar> {
  const tokenData = await prisma.googleToken.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!tokenData) {
    throw new NotFoundError("Google Calendar is not connected");
  }

  const oauth2Client = getGoogleOAuth2Client();

  // Check if token is expired and refresh if needed
  const now = new Date();
  if (tokenData.expiryDate <= now) {
    // Token expired, refresh it
    oauth2Client.setCredentials({
      refresh_token: tokenData.refreshToken,
    });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      const expiryDate = credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : new Date(Date.now() + 3600 * 1000); // Default 1 hour

      // Update token in database
      await prisma.googleToken.update({
        where: { id: tokenData.id },
        data: {
          accessToken: credentials.access_token || tokenData.accessToken,
          expiryDate,
        },
      });

      oauth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: tokenData.refreshToken,
      });
    } catch (error) {
      throw new Error("Failed to refresh Google access token");
    }
  } else {
    oauth2Client.setCredentials({
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken,
    });
  }

  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Gets or creates the exclusive calendar for the app
 */
async function getOrCreateCalendar(): Promise<string> {
  const tokenData = await prisma.googleToken.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!tokenData) {
    throw new NotFoundError("Google Calendar is not connected");
  }

  // If calendarId is already stored, return it
  if (tokenData.calendarId) {
    return tokenData.calendarId;
  }

  // Otherwise, create the calendar
  const calendarService = await getCalendarService();

  try {
    const response = await calendarService.calendars.insert({
      requestBody: {
        summary: CALENDAR_NAME,
        description:
          "Calendario exclusivo para reservas de sesiones fotográficas",
        timeZone: "America/Bogota", // Adjust timezone as needed
      },
    });

    const calendarId = response.data.id;

    if (!calendarId) {
      throw new Error("Failed to create calendar: no ID returned");
    }

    // Save calendarId to database
    await prisma.googleToken.update({
      where: { id: tokenData.id },
      data: { calendarId },
    });

    return calendarId;
  } catch (error) {
    throw new Error(`Failed to create calendar: ${error}`);
  }
}

export interface CreateEventData {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{ email: string }>;
  reminders?: {
    useDefault?: boolean;
    overrides?: Array<{
      method: "email" | "popup";
      minutes: number;
    }>;
  };
}

/**
 * Creates an event in the exclusive calendar
 */
export async function createEvent(
  eventData: CreateEventData
): Promise<calendar_v3.Schema$Event> {
  const calendarService = await getCalendarService();
  const calendarId = await getOrCreateCalendar();

  const response = await calendarService.events.insert({
    calendarId,
    requestBody: {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.start.dateTime,
        timeZone: eventData.start.timeZone || "America/Bogota",
      },
      end: {
        dateTime: eventData.end.dateTime,
        timeZone: eventData.end.timeZone || "America/Bogota",
      },
      attendees: eventData.attendees,
      reminders: eventData.reminders || {
        useDefault: true,
      },
    },
  });

  if (!response.data) {
    throw new Error("Failed to create event: no data returned");
  }

  return response.data;
}

/**
 * Lists events from the exclusive calendar
 */
export async function listEvents(
  timeMin?: string,
  timeMax?: string,
  maxResults: number = 50
): Promise<calendar_v3.Schema$Event[]> {
  const calendarService = await getCalendarService();
  const calendarId = await getOrCreateCalendar();

  const response = await calendarService.events.list({
    calendarId,
    timeMin: timeMin || new Date().toISOString(),
    timeMax,
    maxResults,
    singleEvents: true,
    orderBy: "startTime",
  });

  return response.data.items || [];
}

/**
 * Deletes an event from the exclusive calendar
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const calendarService = await getCalendarService();
  const calendarId = await getOrCreateCalendar();

  await calendarService.events.delete({
    calendarId,
    eventId,
  });
}

/**
 * Updates an event in the exclusive calendar
 */
export async function updateEvent(
  eventId: string,
  eventData: Partial<CreateEventData>
): Promise<calendar_v3.Schema$Event> {
  const calendarService = await getCalendarService();
  const calendarId = await getOrCreateCalendar();

  const updateData: calendar_v3.Schema$Event = {};

  if (eventData.summary) updateData.summary = eventData.summary;
  if (eventData.description !== undefined)
    updateData.description = eventData.description;
  if (eventData.start) {
    updateData.start = {
      dateTime: eventData.start.dateTime,
      timeZone: eventData.start.timeZone || "America/Bogota",
    };
  }
  if (eventData.end) {
    updateData.end = {
      dateTime: eventData.end.dateTime,
      timeZone: eventData.end.timeZone || "America/Bogota",
    };
  }
  if (eventData.attendees) updateData.attendees = eventData.attendees;
  if (eventData.reminders) updateData.reminders = eventData.reminders;

  const response = await calendarService.events.update({
    calendarId,
    eventId,
    requestBody: updateData,
  });

  if (!response.data) {
    throw new Error("Failed to update event: no data returned");
  }

  return response.data;
}

/**
 * Gets the calendar connection status
 */
export async function getCalendarStatus(): Promise<{
  connected: boolean;
  calendarId: string | null;
  calendarName: string | null;
}> {
  const tokenData = await prisma.googleToken.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!tokenData) {
    return {
      connected: false,
      calendarId: null,
      calendarName: null,
    };
  }

  return {
    connected: true,
    calendarId: tokenData.calendarId,
    calendarName: tokenData.calendarId ? CALENDAR_NAME : null,
  };
}
