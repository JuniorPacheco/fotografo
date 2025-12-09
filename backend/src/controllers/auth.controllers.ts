import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../types/auth";
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors";
import { generateToken } from "../utils/jwt";
import { comparePassword } from "../utils/password";

// Schemas de validación
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// const registerSchema = z.object({
//   email: z.string().email("Invalid email format"),
//   password: z.string().min(8, "Password must be at least 8 characters"),
//   name: z.string().min(1, "Name is required").optional(),
// });

// Controlador de login
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);
    const { email, password } = body;

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedError("User account is inactive");
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      );
    }
    throw error;
  }
}

// Controlador de registro (bloqueado por ahora)
export async function register(_req: Request, _res: Response): Promise<void> {
  // Bloquear registro por ahora
  throw new ForbiddenError(
    "Registration is currently disabled. Users are created via seeder."
  );
}

// Controlador para obtener el usuario actual
export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
}
