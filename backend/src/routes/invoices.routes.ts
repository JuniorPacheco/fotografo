import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../validators/validateRequest";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import * as invoicesControllers from "../controllers/invoices.controllers";
import { z } from "zod";

const router: Router = Router();

// Schemas de validación
const createInvoiceSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  totalAmount: z.number().positive("Total amount must be positive"),
  maxNumberSessions: z.number().int().positive().min(1).max(100).optional(),
  photosFolderPath: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  status: z
    .enum([
      "PENDING",
      "IN_PROGRESS",
      "COMPLETED_PENDING_PHOTOS",
      "COMPLETED_PHOTOS_READY",
      "COMPLETED_AND_CLAIMED",
      "CANCELLED",
    ])
    .optional(),
});

const updateInvoiceSchema = z.object({
  clientId: z.string().uuid("Invalid client ID").optional(),
  totalAmount: z.number().positive("Total amount must be positive").optional(),
  maxNumberSessions: z.number().int().positive().min(1).max(100).optional(),
  photosFolderPath: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  status: z
    .enum([
      "PENDING",
      "IN_PROGRESS",
      "COMPLETED_PENDING_PHOTOS",
      "COMPLETED_PHOTOS_READY",
      "COMPLETED_AND_CLAIMED",
      "CANCELLED",
    ])
    .optional(),
});

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     description: Create a new invoice for a client. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - totalAmount
 *             properties:
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               totalAmount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 500.00
 *               maxNumberSessions:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 1
 *                 example: 3
 *               photosFolderPath:
 *                 type: string
 *                 maxLength: 500
 *                 example: "C:\\Fotos\\Cliente123"
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Sesión de boda"
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED_PENDING_PHOTOS, COMPLETED_PHOTOS_READY, COMPLETED_AND_CLAIMED, CANCELLED]
 *                 default: PENDING
 *     responses:
 *       201:
 *         description: Invoice created successfully
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
 *                     invoice:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Client not found
 */
router.post(
  "/",
  authenticate,
  authorize("OWNER", "ADMIN"),
  validateRequest(createInvoiceSchema),
  asyncHandler(invoicesControllers.createInvoice)
);

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Get all invoices with pagination and filters
 *     tags: [Invoices]
 *     description: Retrieve all invoices with calculated paid amounts, pagination, date range filtering, client name filtering, and sorting. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering invoices (ISO 8601 format, e.g., 2024-01-01)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering invoices (ISO 8601 format, e.g., 2024-12-31)
 *         example: "2024-12-31"
 *       - in: query
 *         name: clientName
 *         schema:
 *           type: string
 *         description: Filter invoices by client name (case-insensitive partial match)
 *         example: "Juan"
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order by creation date (asc = oldest first, desc = newest first)
 *     responses:
 *       200:
 *         description: List of invoices with pagination
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
 *                     invoices:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           clientId:
 *                             type: string
 *                           totalAmount:
 *                             type: number
 *                           paidAmount:
 *                             type: number
 *                           remainingAmount:
 *                             type: number
 *                           status:
 *                             type: string
 *                           maxNumberSessions:
 *                             type: integer
 *                           photosFolderPath:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           client:
 *                             type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPreviousPage:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/",
  authenticate,
  authorize("OWNER", "ADMIN"),
  asyncHandler(invoicesControllers.getInvoices)
);

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     description: Retrieve a specific invoice with all related sessions and payments. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice details
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
 *                     invoice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         clientId:
 *                           type: string
 *                         totalAmount:
 *                           type: number
 *                         paidAmount:
 *                           type: number
 *                         remainingAmount:
 *                           type: number
 *                         status:
 *                           type: string
 *                         maxNumberSessions:
 *                           type: integer
 *                         photosFolderPath:
 *                           type: string
 *                         client:
 *                           type: object
 *                         sessions:
 *                           type: array
 *                         payments:
 *                           type: array
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Invoice not found
 */
router.get(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  asyncHandler(invoicesControllers.getInvoiceById)
);

/**
 * @swagger
 * /invoices/{id}:
 *   put:
 *     summary: Update invoice
 *     tags: [Invoices]
 *     description: Update an existing invoice. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               totalAmount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 600.00
 *               maxNumberSessions:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 example: 5
 *               photosFolderPath:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: "C:\\Fotos\\Cliente123"
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 nullable: true
 *                 example: "Sesión de boda actualizada"
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED_PENDING_PHOTOS, COMPLETED_PHOTOS_READY, COMPLETED_AND_CLAIMED, CANCELLED]
 *     responses:
 *       200:
 *         description: Invoice updated successfully
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
 *                     invoice:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Invoice or Client not found
 */
router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  validateRequest(updateInvoiceSchema),
  asyncHandler(invoicesControllers.updateInvoice)
);

/**
 * @swagger
 * /invoices/{id}:
 *   delete:
 *     summary: Delete invoice
 *     tags: [Invoices]
 *     description: Delete an invoice and all related sessions and payments (cascade delete). Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
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
 *         description: Invoice not found
 */
router.delete(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  asyncHandler(invoicesControllers.deleteInvoice)
);

export default router;
