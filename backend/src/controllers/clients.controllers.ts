import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { ValidationError, NotFoundError } from "../utils/errors";

// Schemas de validación
const createClientSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  phone: z.string().min(1, "Phone is required").max(20),
  address: z.string().min(1, "Address is required").max(500),
  email: z
    .union([z.string().email("Invalid email format").max(255), z.literal("")])
    .optional(),
  cedula: z.string().max(20).optional(),
});

const updateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().min(1).max(20).optional(),
  address: z.string().min(1).max(500).optional(),
  email: z
    .union([z.string().email("Invalid email format").max(255), z.literal("")])
    .optional()
    .nullable(),
  cedula: z.string().max(20).optional().nullable(),
});

// Crear cliente
export async function createClient(req: Request, res: Response): Promise<void> {
  try {
    const body = createClientSchema.parse(req.body);
    const { name, phone, address, email, cedula } = body;

    const client = await prisma.client.create({
      data: {
        name,
        phone,
        address,
        email: email && email.trim() !== "" ? email.trim() : null,
        cedula: cedula || null,
      },
    });

    res.status(201).json({
      success: true,
      data: { client },
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

// Obtener todos los clientes con paginación y filtros
export async function getClients(req: Request, res: Response): Promise<void> {
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

  // Obtener clientes con paginación
  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (validPage - 1) * validLimit,
      take: validLimit,
      orderBy: {
        createdAt: validOrderBy,
      },
    }),
    prisma.client.count({ where }),
  ]);

  const totalPages = Math.ceil(total / validLimit);

  res.status(200).json({
    success: true,
    data: {
      clients,
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

// Obtener cliente por ID
export async function getClientById(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  const client = await prisma.client.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!client) {
    throw new NotFoundError("Client not found");
  }

  res.status(200).json({
    success: true,
    data: { client },
  });
}

// Actualizar cliente
export async function updateClient(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const body = updateClientSchema.parse(req.body);

    // Verificar que el cliente existe y no está eliminado
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingClient) {
      throw new NotFoundError("Client not found");
    }

    // Transform email: empty string becomes null
    const updateData = {
      ...body,
      email:
        body.email !== undefined
          ? body.email && body.email.trim() !== ""
            ? body.email.trim()
            : null
          : undefined,
    };

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: { client },
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

// Eliminar cliente (soft delete)
export async function deleteClient(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  // Verificar que el cliente existe y no está eliminado
  const existingClient = await prisma.client.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existingClient) {
    throw new NotFoundError("Client not found");
  }

  // Soft delete: marcar deletedAt
  await prisma.client.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  res.status(200).json({
    success: true,
    message: "Client deleted successfully",
  });
}
