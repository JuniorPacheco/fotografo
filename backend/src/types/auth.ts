// Tipo temporal hasta que Prisma genere los enums
// Después de ejecutar prisma generate, cambiar a:
// import { UserRole } from "../generated/prisma/enums";
export type UserRole =
  | "OWNER"
  | "ADMIN"
  | "PHOTOGRAPHER"
  | "ASSISTANT"
  | "VIEWER";

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
