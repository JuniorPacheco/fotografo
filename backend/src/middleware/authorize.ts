import { NextFunction, Response } from "express";
import { AuthenticatedRequest, UserRole } from "../types/auth";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";

export function authorize(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      throw new UnauthorizedError("User not authenticated");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        "You don't have permission to access this resource"
      );
    }

    next();
  };
}
