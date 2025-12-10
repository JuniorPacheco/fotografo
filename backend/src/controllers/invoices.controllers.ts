import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { ValidationError, NotFoundError } from "../utils/errors";
import { createPhotosReadyReminders } from "../services/reminder.service";

// Schemas de validación
const createInvoiceSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  packageId: z.string().uuid("Invalid package ID").optional().nullable(),
  totalAmount: z.number().positive("Total amount must be positive"),
  maxNumberSessions: z.number().int().positive().min(1).max(100).optional(),
  photosFolderPath: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  status: z
    .enum([
      "PENDING",
      "IN_PROGRESS",
      "COMPLETED_PENDING_PHOTOS",
      "COMPLETED_PHOTOS_READY",
      "CANCELLED",
    ])
    .optional(),
});

const updateInvoiceSchema = z.object({
  clientId: z.string().uuid("Invalid client ID").optional(),
  packageId: z.string().uuid("Invalid package ID").optional().nullable(),
  totalAmount: z.number().positive("Total amount must be positive").optional(),
  maxNumberSessions: z.number().int().positive().min(1).max(100).optional(),
  photosFolderPath: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  status: z
    .enum([
      "PENDING",
      "IN_PROGRESS",
      "COMPLETED_PENDING_PHOTOS",
      "COMPLETED_PHOTOS_READY",
      "CANCELLED",
    ])
    .optional(),
});

// Crear factura
export async function createInvoice(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const body = createInvoiceSchema.parse(req.body);
    const {
      clientId,
      packageId,
      totalAmount,
      maxNumberSessions,
      photosFolderPath,
      notes,
      status,
    } = body;

    // Verificar que el cliente existe y no está eliminado
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw new NotFoundError("Client not found");
    }

    // Verificar que el paquete existe si se proporciona
    if (packageId) {
      const package_ = await prisma.package.findFirst({
        where: {
          id: packageId,
          deletedAt: null,
        },
      });

      if (!package_) {
        throw new NotFoundError("Package not found");
      }
    }

    const finalStatus = status || "PENDING";
    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        packageId: packageId || null,
        totalAmount,
        maxNumberSessions: maxNumberSessions || 1,
        photosFolderPath: photosFolderPath || null,
        notes: notes || null,
        status: finalStatus,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // Crear recordatorios si el status es COMPLETED_PHOTOS_READY al crear
    if (finalStatus === "COMPLETED_PHOTOS_READY") {
      try {
        await createPhotosReadyReminders(invoice.id, client.name);
      } catch (error) {
        // Log error but don't fail invoice creation if reminder creation fails
        console.error("Failed to create photos ready reminders:", error);
      }
    }

    res.status(201).json({
      success: true,
      data: { invoice },
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

// Obtener todas las facturas con paginación y filtros
export async function getInvoices(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const clientName = req.query.clientName as string | undefined;
  const orderBy = (req.query.orderBy as string) || "desc"; // "asc" o "desc"

  // Validar límites
  const validLimit = Math.min(Math.max(limit, 1), 100); // Entre 1 y 100
  const validPage = Math.max(page, 1);
  const validOrderBy = orderBy.toLowerCase() === "asc" ? "asc" : "desc";

  // Construir filtros
  const where: {
    createdAt?: {
      gte?: Date;
      lte?: Date;
    };
    client?: {
      name?: {
        contains: string;
        mode?: "insensitive";
      };
    };
  } = {};

  // Filtro por rango de fechas
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      // Agregar un día completo para incluir el día final
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDateObj;
    }
  }

  // Filtro por nombre del cliente
  if (clientName) {
    where.client = {
      name: {
        contains: clientName,
        mode: "insensitive",
      },
    };
  }

  // Obtener facturas con paginación
  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip: (validPage - 1) * validLimit,
      take: validLimit,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            sessions: true,
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: validOrderBy,
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  // Calcular paidAmount para cada factura
  const invoicesWithPaidAmount = await Promise.all(
    invoices.map(async (invoice) => {
      const payments = await prisma.payment.findMany({
        where: { invoiceId: invoice.id },
        select: { amount: true },
      });

      const paidAmount = payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );

      return {
        ...invoice,
        paidAmount,
        remainingAmount: Number(invoice.totalAmount) - paidAmount,
      };
    })
  );

  const totalPages = Math.ceil(total / validLimit);

  res.status(200).json({
    success: true,
    data: {
      invoices: invoicesWithPaidAmount,
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

// Obtener factura por ID
export async function getInvoiceById(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          cedula: true,
        },
      },
      package: {
        select: {
          id: true,
          name: true,
          suggestedPrice: true,
        },
      },
      sessions: {
        orderBy: {
          sessionNumber: "asc",
        },
      },
      payments: {
        orderBy: {
          paymentDate: "desc",
        },
      },
    },
  });

  if (!invoice) {
    throw new NotFoundError("Invoice not found");
  }

  // Calcular paidAmount
  const payments = await prisma.payment.findMany({
    where: { invoiceId: invoice.id },
    select: { amount: true },
  });

  const paidAmount = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  res.status(200).json({
    success: true,
    data: {
      invoice: {
        ...invoice,
        paidAmount,
        remainingAmount: Number(invoice.totalAmount) - paidAmount,
      },
    },
  });
}

// Actualizar factura
export async function updateInvoice(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const body = updateInvoiceSchema.parse(req.body);

    // Verificar que la factura existe y obtener el cliente
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existingInvoice) {
      throw new NotFoundError("Invoice not found");
    }

    // Si se actualiza clientId, verificar que el cliente existe
    if (body.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: body.clientId,
          deletedAt: null,
        },
      });

      if (!client) {
        throw new NotFoundError("Client not found");
      }
    }

    // Si se actualiza packageId, verificar que el paquete existe
    if (body.packageId !== undefined) {
      if (body.packageId) {
        const package_ = await prisma.package.findFirst({
          where: {
            id: body.packageId,
            deletedAt: null,
          },
        });

        if (!package_) {
          throw new NotFoundError("Package not found");
        }
      }
    }

    // Verificar si el status está cambiando a COMPLETED_PHOTOS_READY
    const newStatus = body.status;
    const isChangingToPhotosReady =
      newStatus === "COMPLETED_PHOTOS_READY" &&
      existingInvoice.status !== "COMPLETED_PHOTOS_READY";

    const invoice = await prisma.invoice.update({
      where: { id },
      data: body,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // Crear recordatorios si el status cambió a COMPLETED_PHOTOS_READY
    // Esto también eliminará recordatorios anteriores del mismo tipo para esta factura
    if (isChangingToPhotosReady) {
      try {
        await createPhotosReadyReminders(id, existingInvoice.client.name);
      } catch (error) {
        // Log error but don't fail invoice update if reminder creation fails
        console.error("Failed to create photos ready reminders:", error);
      }
    }

    res.status(200).json({
      success: true,
      data: { invoice },
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

// Eliminar factura
export async function deleteInvoice(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  // Verificar que la factura existe
  const existingInvoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!existingInvoice) {
    throw new NotFoundError("Invoice not found");
  }

  // Eliminar factura (cascade eliminará sesiones y pagos)
  await prisma.invoice.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: "Invoice deleted successfully",
  });
}
