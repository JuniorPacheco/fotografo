import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../validators/validateRequest";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import * as paymentsControllers from "../controllers/payments.controllers";
import { z } from "zod";
import { PaymentMethod } from "../generated/prisma/enums";

const router: Router = Router();

// Schemas de validación
const createPaymentSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
  amount: z.number().positive("Amount must be positive"),
  method: z.nativeEnum(PaymentMethod).optional(),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

const updatePaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  paymentDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     description: Create a new payment for an invoice. Only OWNER and ADMIN can access this endpoint.
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
 *               - amount
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 150.00
 *               method:
 *                 type: string
 *                 enum: [CASH, TRANSFER, CARD, OTHER]
 *                 default: CASH
 *                 example: "TRANSFER"
 *               paymentDate:
 *                 type: string
 *                 format: date-time
 *                 description: Payment date. If not provided, uses current date.
 *                 example: "2024-11-20T10:00:00Z"
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Pago parcial de sesión 1"
 *     responses:
 *       201:
 *         description: Payment created successfully
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
 *                     payment:
 *                       type: object
 *       400:
 *         description: Validation error
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
  validateRequest(createPaymentSchema),
  asyncHandler(paymentsControllers.createPayment)
);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments with pagination, filters, and sorting
 *     tags: [Payments]
 *     description: Retrieve all payments with pagination support, client name filtering, and sorting by payment date. Only OWNER and ADMIN can access this endpoint.
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
 *         name: clientName
 *         schema:
 *           type: string
 *         description: Filter payments by client name (case-insensitive partial match)
 *         example: "Juan"
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order by payment date (asc = oldest first, desc = newest first)
 *     responses:
 *       200:
 *         description: List of payments with pagination info
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
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           invoiceId:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           method:
 *                             type: string
 *                           paymentDate:
 *                             type: string
 *                             format: date-time
 *                           notes:
 *                             type: string
 *                           invoice:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               client:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   name:
 *                                     type: string
 *                                   phone:
 *                                     type: string
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
  asyncHandler(paymentsControllers.getAllPayments)
);

/**
 * @swagger
 * /payments/invoice/{invoiceId}:
 *   get:
 *     summary: Get all payments for an invoice
 *     tags: [Payments]
 *     description: Retrieve all payments associated with a specific invoice. Only OWNER and ADMIN can access this endpoint.
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
 *         description: List of payments for the invoice
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
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *                     invoice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         totalAmount:
 *                           type: number
 *                         totalPaid:
 *                           type: number
 *                         remainingAmount:
 *                           type: number
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
  asyncHandler(paymentsControllers.getPaymentsByInvoice)
);

/**
 * @swagger
 * /payments/daily-sales:
 *   get:
 *     summary: Get daily sales report
 *     tags: [Payments]
 *     description: Retrieve all payments for a specific date with totals and breakdown by payment method. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         description: Date in YYYY-MM-DD format
 *         example: "2024-12-09"
 *     responses:
 *       200:
 *         description: Daily sales report
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
 *                     date:
 *                       type: string
 *                     totalAmount:
 *                       type: number
 *                     totalPayments:
 *                       type: integer
 *                     totalsByMethod:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/daily-sales",
  authenticate,
  authorize("OWNER", "ADMIN"),
  asyncHandler(paymentsControllers.getDailySales)
);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     description: Retrieve a specific payment with invoice and client information. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
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
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         invoiceId:
 *                           type: string
 *                         amount:
 *                           type: number
 *                         method:
 *                           type: string
 *                         paymentDate:
 *                           type: string
 *                           format: date-time
 *                         notes:
 *                           type: string
 *                         invoice:
 *                           type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Payment not found
 */
router.get(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  asyncHandler(paymentsControllers.getPaymentById)
);

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Update payment
 *     tags: [Payments]
 *     description: Update an existing payment. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 200.00
 *               method:
 *                 type: string
 *                 enum: [CASH, TRANSFER, CARD, OTHER]
 *                 example: "CARD"
 *               paymentDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2024-11-20T10:00:00Z"
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 nullable: true
 *                 example: "Pago actualizado"
 *     responses:
 *       200:
 *         description: Payment updated successfully
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
 *                     payment:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Payment not found
 */
router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  validateRequest(updatePaymentSchema),
  asyncHandler(paymentsControllers.updatePayment)
);

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     summary: Delete payment
 *     tags: [Payments]
 *     description: Delete a payment. Only OWNER and ADMIN can access this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment deleted successfully
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
 *         description: Payment not found
 */
router.delete(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  asyncHandler(paymentsControllers.deletePayment)
);

export default router;
