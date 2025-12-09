import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../validators/validateRequest";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import * as sessionsControllers from "../controllers/sessions.controllers";
import { z } from "zod";

const router: Router = Router();

// Schemas de validación
const createSessionSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
  sessionNumber: z.number().int().positive().optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
  selectedPhotos: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
});

const updateSessionSchema = z.object({
  sessionNumber: z.number().int().positive().optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
  selectedPhotos: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     description: Create a new session for an invoice. Validates that the invoice's maxNumberSessions limit is not exceeded. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               sessionNumber:
 *                 type: integer
 *                 minimum: 1
 *                 description: Session number. If not provided, will be auto-calculated.
 *                 example: 1
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-11-20T10:00:00Z"
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, COMPLETED, CANCELLED]
 *                 default: SCHEDULED
 *               selectedPhotos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of photo URLs or paths selected by the client
 *                 example: ["photo1.jpg", "photo2.jpg"]
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Sesión de fotos de boda"
 *     responses:
 *       201:
 *         description: Session created successfully
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
 *                     session:
 *                       type: object
 *       400:
 *         description: Validation error or maximum sessions limit reached
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Invoice not found
 */
router.post(
  "/",
  authenticate,
  authorize("OWNER", "ADMIN"),
  validateRequest(createSessionSchema),
  asyncHandler(sessionsControllers.createSession)
);

/**
 * @swagger
 * /sessions/invoice/{invoiceId}:
 *   get:
 *     summary: Get all sessions for an invoice
 *     tags: [Sessions]
 *     description: Retrieve all sessions associated with a specific invoice. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: List of sessions for the invoice
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
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     invoice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         maxNumberSessions:
 *                           type: integer
 *                         totalSessions:
 *                           type: integer
 *                         remainingSessions:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Invoice not found
 */
router.get(
  "/invoice/:invoiceId",
  authenticate,
  authorize("OWNER", "ADMIN"),
  asyncHandler(sessionsControllers.getSessionsByInvoice)
);

/**
 * @swagger
 * /sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     tags: [Sessions]
 *     description: Retrieve a specific session with invoice and client information. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session details
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
 *                     session:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         invoiceId:
 *                           type: string
 *                         sessionNumber:
 *                           type: integer
 *                         scheduledAt:
 *                           type: string
 *                           format: date-time
 *                         status:
 *                           type: string
 *                         selectedPhotos:
 *                           type: array
 *                           items:
 *                             type: string
 *                         notes:
 *                           type: string
 *                         invoice:
 *                           type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Session not found
 */
router.get(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  asyncHandler(sessionsControllers.getSessionById)
);

/**
 * @swagger
 * /sessions/{id}:
 *   put:
 *     summary: Update session
 *     tags: [Sessions]
 *     description: Update an existing session. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionNumber:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2024-11-20T10:00:00Z"
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, COMPLETED, CANCELLED]
 *                 example: "COMPLETED"
 *               selectedPhotos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["photo1.jpg", "photo2.jpg", "photo3.jpg"]
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 nullable: true
 *                 example: "Sesión completada exitosamente"
 *     responses:
 *       200:
 *         description: Session updated successfully
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
 *                     session:
 *                       type: object
 *       400:
 *         description: Validation error or duplicate session number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Session not found
 */
router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  validateRequest(updateSessionSchema),
  asyncHandler(sessionsControllers.updateSession)
);

/**
 * @swagger
 * /sessions/{id}:
 *   delete:
 *     summary: Delete session
 *     tags: [Sessions]
 *     description: Delete a session. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
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
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Session not found
 */
router.delete(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  asyncHandler(sessionsControllers.deleteSession)
);

export default router;
