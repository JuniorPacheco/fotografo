import { Router } from "express";
import { getReminders } from "../controllers/reminders.controllers";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { UserRole } from "../generated/prisma/enums";

const router: Router = Router();

// Ruta para obtener todos los recordatorios con paginación
router.get(
  "/",
  authenticate,
  authorize(...[UserRole.ADMIN, UserRole.OWNER]),
  asyncHandler(getReminders)
);

export default router;
