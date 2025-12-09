import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import * as googleCalendarControllers from "../controllers/googleCalendar.controllers";

const router: Router = Router();

/**
 * @swagger
 * /google-calendar/auth/url:
 *   get:
 *     summary: Get Google OAuth2 consent URL
 *     tags: [Google Calendar]
 *     description: Generates the OAuth2 consent URL for Google Calendar integration. Only OWNER can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OAuth2 consent URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     authUrl:
 *                       type: string
 *                       example: https://accounts.google.com/o/oauth2/v2/auth?...
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Only OWNER can access this endpoint
 */
router.get(
  "/auth/url",
  authenticate,
  authorize("OWNER"),
  asyncHandler(googleCalendarControllers.getGoogleAuthUrlHandler)
);

/**
 * @swagger
 * /google-calendar/auth/callback:
 *   get:
 *     summary: Handle Google OAuth2 callback
 *     tags: [Google Calendar]
 *     description: Handles the OAuth2 callback from Google, saves tokens, and creates the exclusive calendar if needed. This endpoint is public as it's called by Google's OAuth redirect, but only the OWNER can initiate the OAuth flow from the authenticated /auth/url endpoint.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *     responses:
 *       200:
 *         description: Google Calendar connected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     tokenId:
 *                       type: string
 *       400:
 *         description: Validation error - Missing or invalid authorization code
 */
router.get(
  "/auth/callback",
  asyncHandler(googleCalendarControllers.handleGoogleCallback)
);

/**
 * @swagger
 * /google-calendar/status:
 *   get:
 *     summary: Get Google Calendar connection status
 *     tags: [Google Calendar]
 *     description: Returns the current connection status of Google Calendar
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connection status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     connected:
 *                       type: boolean
 *                     calendarId:
 *                       type: string
 *                       nullable: true
 *                     calendarName:
 *                       type: string
 *                       nullable: true
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get(
  "/status",
  authenticate,
  asyncHandler(googleCalendarControllers.getGoogleCalendarStatus)
);

/**
 * @swagger
 * /google-calendar/disconnect:
 *   delete:
 *     summary: Disconnect Google Calendar
 *     tags: [Google Calendar]
 *     description: Disconnects Google Calendar by deleting stored tokens. Only OWNER can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Google Calendar disconnected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Only OWNER can access this endpoint
 *       404:
 *         description: Google Calendar is not connected
 */
router.delete(
  "/disconnect",
  authenticate,
  authorize("OWNER"),
  asyncHandler(googleCalendarControllers.disconnectGoogleCalendar)
);

export default router;
