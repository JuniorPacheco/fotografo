import jwt from "jsonwebtoken";
import { ENVIRONMENTS } from "../config/env";
import { JWTPayload } from "../types/auth";

const JWT_EXPIRES_IN = "2h";

export function generateToken(payload: JWTPayload): string {
  if (!ENVIRONMENTS.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, ENVIRONMENTS.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JWTPayload {
  if (!ENVIRONMENTS.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  try {
    const decoded = jwt.verify(token, ENVIRONMENTS.JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    throw new Error("Token verification failed");
  }
}
