import { protectedApi } from "./api";

export interface GoogleCalendarStatus {
  connected: boolean;
  calendarId: string | null;
  calendarName: string | null;
}

export interface GoogleCalendarStatusResponse {
  success: boolean;
  data: GoogleCalendarStatus;
}

export interface GoogleAuthUrlResponse {
  success: boolean;
  data: {
    authUrl: string;
  };
}

export interface DisconnectResponse {
  success: boolean;
  message: string;
}

export const googleCalendarService = {
  /**
   * Gets the Google OAuth2 consent URL
   */
  getAuthUrl: async (): Promise<GoogleAuthUrlResponse> => {
    const response = await protectedApi.get<GoogleAuthUrlResponse>(
      "/google-calendar/auth/url"
    );
    return response.data;
  },

  /**
   * Gets the current Google Calendar connection status
   */
  getStatus: async (): Promise<GoogleCalendarStatusResponse> => {
    const response = await protectedApi.get<GoogleCalendarStatusResponse>(
      "/google-calendar/status"
    );
    return response.data;
  },

  /**
   * Disconnects Google Calendar
   */
  disconnect: async (): Promise<DisconnectResponse> => {
    const response = await protectedApi.delete<DisconnectResponse>(
      "/google-calendar/disconnect"
    );
    return response.data;
  },
};
