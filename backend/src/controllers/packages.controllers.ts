import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { ValidationError, NotFoundError } from "../utils/errors";

// Schemas de validación
const createPackageSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  suggestedPrice: z.number().positive("Suggested price must be positive"),
});

const updatePackageSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  suggestedPrice: z
    .number()
    .positive("Suggested price must be positive")
    .optional(),
});

// Crear paquete
export async function createPackage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const body = createPackageSchema.parse(req.body);
    const { name, suggestedPrice } = body;

    const package_ = await prisma.package.create({
      data: {
        name,
        suggestedPrice,
      },
    });

    res.status(201).json({
      success: true,
      data: { package: package_ },
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

// Obtener todos los paquetes con paginación y filtros
export async function getPackages(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const name = req.query.name as string | undefined;
  const orderBy = (req.query.orderBy as string) || "desc"; // "asc" o "desc"

  // Validar límites
  const validLimit = Math.min(Math.max(limit, 1), 100); // Entre 1 y 100
  const validPage = Math.max(page, 1);
  const validOrderBy = orderBy.toLowerCase() === "asc" ? "asc" : "desc";

  // Construir filtros
  const where: {
    deletedAt: null;
    name?: {
      contains: string;
      mode?: "insensitive";
    };
  } = {
    deletedAt: null,
  };

  // Filtro por nombre
  if (name) {
    where.name = {
      contains: name,
      mode: "insensitive",
    };
  }

  // Obtener paquetes con paginación
  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where,
      skip: (validPage - 1) * validLimit,
      take: validLimit,
      orderBy: {
        createdAt: validOrderBy,
      },
    }),
    prisma.package.count({ where }),
  ]);

  const totalPages = Math.ceil(total / validLimit);

  res.status(200).json({
    success: true,
    data: {
      packages,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1,
      },
    },
  });
}

// Obtener paquete por ID
export async function getPackageById(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  const package_ = await prisma.package.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!package_) {
    throw new NotFoundError("Package not found");
  }

  res.status(200).json({
    success: true,
    data: { package: package_ },
  });
}

// Actualizar paquete
export async function updatePackage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const body = updatePackageSchema.parse(req.body);

    // Verificar que el paquete existe y no está eliminado
    const existingPackage = await prisma.package.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingPackage) {
      throw new NotFoundError("Package not found");
    }

    const package_ = await prisma.package.update({
      where: { id },
      data: body,
    });

    res.status(200).json({
      success: true,
      data: { package: package_ },
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

// Eliminar paquete (soft delete)
export async function deletePackage(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  // Verificar que el paquete existe y no está eliminado
  const existingPackage = await prisma.package.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existingPackage) {
    throw new NotFoundError("Package not found");
  }

  // Soft delete: marcar deletedAt
  await prisma.package.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  res.status(200).json({
    success: true,
    message: "Package deleted successfully",
  });
}
