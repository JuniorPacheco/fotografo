import { Request, Response } from "express";
import { getGoogleAuthUrl, getGoogleOAuth2Client } from "../utils/googleClient";
import { prisma } from "../config/prisma";
import { getCalendarStatus } from "../utils/googleCalendar";
import { NotFoundError, ValidationError } from "../utils/errors";

/**
 * Generates Google OAuth2 consent URL
 * Only OWNER can access this endpoint
 */
export async function getGoogleAuthUrlHandler(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const authUrl = getGoogleAuthUrl();
    res.status(200).json({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new ValidationError(error.message);
    }
    throw error;
  }
}

/**
 * Handles Google OAuth2 callback
 * This endpoint is public as it's called by Google's OAuth redirect
 * Security: Only OWNER can initiate the OAuth flow from the authenticated /auth/url endpoint
 */
export async function handleGoogleCallback(
  req: Request,
  res: Response
): Promise<void> {
  const { code, error: oauthError } = req.query;

  // Handle OAuth errors from Google
  if (oauthError) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const errorMessage = encodeURIComponent(
      `Error de autorización: ${oauthError}`
    );
    res.redirect(`${frontendUrl}/google/callback?error=${errorMessage}`);
    return;
  }

  if (!code || typeof code !== "string") {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const errorMessage = encodeURIComponent(
      "Código de autorización no proporcionado"
    );
    res.redirect(`${frontendUrl}/google/callback?error=${errorMessage}`);
    return;
  }

  try {
    const oauth2Client = getGoogleOAuth2Client();

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const errorMessage = encodeURIComponent(
        "Error al obtener tokens de acceso"
      );
      res.redirect(`${frontendUrl}/google/callback?error=${errorMessage}`);
      return;
    }

    const expiryDate = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000); // Default 1 hour if not provided

    // Delete existing tokens (only one connection allowed)
    await prisma.googleToken.deleteMany({});

    // Save new tokens
    await prisma.googleToken.create({
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        scope: tokens.scope || "",
        expiryDate,
      },
    });

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/google/callback?success=true`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const errorMessage = encodeURIComponent(
      error instanceof Error
        ? error.message
        : "Error al conectar Google Calendar"
    );
    res.redirect(`${frontendUrl}/google/callback?error=${errorMessage}`);
  }
}

/**
 * Gets the current Google Calendar connection status
 */
export async function getGoogleCalendarStatus(
  _req: Request,
  res: Response
): Promise<void> {
  const status = await getCalendarStatus();

  res.status(200).json({
    success: true,
    data: status,
  });
}

/**
 * Disconnects Google Calendar (deletes tokens)
 * Only OWNER can access this endpoint
 */
export async function disconnectGoogleCalendar(
  _req: Request,
  res: Response
): Promise<void> {
  const tokenData = await prisma.googleToken.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!tokenData) {
    throw new NotFoundError("Google Calendar is not connected");
  }

  await prisma.googleToken.deleteMany({});

  res.status(200).json({
    success: true,
    message: "Google Calendar disconnected successfully",
  });
}
