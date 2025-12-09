import { Router } from "express";
import { z } from "zod";
import * as clientsControllers from "../controllers/clients.controllers";
import { UserRole } from "../generated/prisma/enums";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../validators/validateRequest";

const router: Router = Router();

// Schemas de validación
const createClientSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  phone: z.string().min(1, "Phone is required").max(20),
  address: z.string().min(1, "Address is required").max(500),
  cedula: z.string().max(20).optional(),
});

const updateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().min(1).max(20).optional(),
  address: z.string().min(1).max(500).optional(),
  cedula: z.string().max(20).optional().nullable(),
});

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     description: Create a new client in the system
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Juan Pérez
 *               phone:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 20
 *                 example: +1234567890
 *               address:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: Calle Principal 123
 *               cedula:
 *                 type: string
 *                 maxLength: 20
 *                 example: 1234567890
 *     responses:
 *       201:
 *         description: Client created successfully
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
 *                     client:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticate,
  authorize(...[UserRole.ADMIN, UserRole.OWNER]),
  validateRequest(createClientSchema),
  asyncHandler(clientsControllers.createClient)
);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients with pagination and filters
 *     tags: [Clients]
 *     description: Retrieve all active clients (excluding soft-deleted) with pagination, name filtering, and sorting by creation date
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
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter clients by name (case-insensitive partial match)
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
 *         description: List of clients with pagination
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
 *                     clients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           address:
 *                             type: string
 *                           cedula:
 *                             type: string
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
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
 */
router.get(
  "/",
  authenticate,
  authorize(...[UserRole.ADMIN, UserRole.OWNER]),
  asyncHandler(clientsControllers.getClients)
);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     tags: [Clients]
 *     description: Retrieve a specific client by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client details
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
 *                     client:
 *                       type: object
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:id",
  authenticate,
  authorize(...[UserRole.ADMIN, UserRole.OWNER]),
  asyncHandler(clientsControllers.getClientById)
);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Update client
 *     tags: [Clients]
 *     description: Update an existing client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Juan Pérez
 *               phone:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 20
 *                 example: +1234567890
 *               address:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: Calle Principal 123
 *               cedula:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *                 example: 1234567890
 *     responses:
 *       200:
 *         description: Client updated successfully
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
 *                     client:
 *                       type: object
 *       400:
 *         description: Validation error
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/:id",
  authenticate,
  authorize(...[UserRole.ADMIN, UserRole.OWNER]),
  validateRequest(updateClientSchema),
  asyncHandler(clientsControllers.updateClient)
);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Delete client (soft delete)
 *     tags: [Clients]
 *     description: Soft delete a client by setting deletedAt timestamp
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/:id",
  authenticate,
  authorize(...[UserRole.ADMIN, UserRole.OWNER]),
  asyncHandler(clientsControllers.deleteClient)
);

export default router;
