import { google, Auth } from "googleapis";
import { ENVIRONMENTS } from "../config/env";

/**
 * Creates and returns a configured Google OAuth2 client
 */
export function getGoogleOAuth2Client(): Auth.OAuth2Client {
  if (!ENVIRONMENTS.GOOGLE_CLIENT_ID || !ENVIRONMENTS.GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
    );
  }

  return new google.auth.OAuth2(
    ENVIRONMENTS.GOOGLE_CLIENT_ID,
    ENVIRONMENTS.GOOGLE_CLIENT_SECRET,
    ENVIRONMENTS.GOOGLE_REDIRECT_URI
  );
}

/**
 * Generates the OAuth2 consent URL
 */
export function getGoogleAuthUrl(): string {
  const oauth2Client = getGoogleOAuth2Client();

  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent", // Force consent to get refresh_token
  });
}
