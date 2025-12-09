import { Router } from "express";
import {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
} from "../controllers/packages.controllers";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { UserRole } from "../generated/prisma/enums";

const router: Router = Router();

// Rutas
router.post(
  "/",
  authenticate,
  authorize(...[UserRole.ADMIN, UserRole.OWNER]),
  asyncHandler(createPackage)
);
router.get(
  "/",
  authenticate,
  authorize(...[UserRole.ADMIN, UserRole.OWNER]),
  asyncHandler(getPackages)
);
router.get(
  "/:id",
  authenticate,
  authorize(...[UserRole.ADMIN, UserRole.OWNER]),
  asyncHandler(getPackageById)
);
router.put(
  "/:id",
  authenticate,
  authorize(...[UserRole.ADMIN, UserRole.OWNER]),
  asyncHandler(updatePackage)
);
router.delete(
  "/:id",
  authenticate,
  authorize(...[UserRole.ADMIN, UserRole.OWNER]),
  asyncHandler(deletePackage)
);

export default router;
