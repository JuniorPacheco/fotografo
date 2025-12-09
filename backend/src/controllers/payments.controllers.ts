import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { PaymentMethod } from "../generated/prisma/enums";
import { NotFoundError, ValidationError } from "../utils/errors";

// Schemas de validación
const createPaymentSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
  amount: z.number().positive("Amount must be positive"),
  method: z.nativeEnum(PaymentMethod).optional(),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

const updatePaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  paymentDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

// Crear pago
export async function createPayment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const body = createPaymentSchema.parse(req.body);
    const { invoiceId, amount, method, paymentDate, notes } = body;

    // Verificar que el invoice existe
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    // Parsear paymentDate si existe
    const parsedPaymentDate = paymentDate ? new Date(paymentDate) : new Date();

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method: method || PaymentMethod.CASH,
        paymentDate: parsedPaymentDate,
        notes: notes || null,
      },
      include: {
        invoice: {
          select: {
            id: true,
            clientId: true,
            totalAmount: true,
            status: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { payment },
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

// Obtener pagos por invoice
export async function getPaymentsByInvoice(
  req: Request,
  res: Response
): Promise<void> {
  const { invoiceId } = req.params;

  // Verificar que el invoice existe
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new NotFoundError("Invoice not found");
  }

  const payments = await prisma.payment.findMany({
    where: { invoiceId },
    orderBy: {
      paymentDate: "desc",
    },
    include: {
      invoice: {
        select: {
          id: true,
          clientId: true,
          totalAmount: true,
        },
      },
    },
  });

  // Calcular total pagado
  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  res.status(200).json({
    success: true,
    data: {
      payments,
      invoice: {
        id: invoice.id,
        totalAmount: Number(invoice.totalAmount),
        totalPaid,
        remainingAmount: Number(invoice.totalAmount) - totalPaid,
      },
    },
  });
}

// Obtener todos los pagos con paginación y filtros
export async function getAllPayments(
  req: Request,
  res: Response
): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const clientName = req.query.clientName as string | undefined;
  const orderBy = (req.query.orderBy as string) || "desc"; // "asc" o "desc"

  // Validar límites
  const validLimit = Math.min(Math.max(limit, 1), 100); // Entre 1 y 100
  const validPage = Math.max(page, 1);
  const validOrderBy = orderBy.toLowerCase() === "asc" ? "asc" : "desc";

  // Construir filtros
  const where: {
    invoice?: {
      client?: {
        name?: {
          contains: string;
          mode?: "insensitive";
        };
      };
    };
  } = {};

  // Filtro por nombre del cliente
  if (clientName) {
    where.invoice = {
      client: {
        name: {
          contains: clientName,
          mode: "insensitive",
        },
      },
    };
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip: (validPage - 1) * validLimit,
      take: validLimit,
      orderBy: {
        paymentDate: validOrderBy,
      },
      include: {
        invoice: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / validLimit);

  res.status(200).json({
    success: true,
    data: {
      payments,
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

// Obtener pago por ID
export async function getPaymentById(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      invoice: {
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  res.status(200).json({
    success: true,
    data: { payment },
  });
}

// Actualizar pago
export async function updatePayment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const body = updatePaymentSchema.parse(req.body);

    // Verificar que el pago existe
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      throw new NotFoundError("Payment not found");
    }

    // Parsear paymentDate si existe
    const updateData: {
      amount?: number;
      method?: PaymentMethod;
      paymentDate?: Date;
      notes?: string | null;
    } = {
      ...body,
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : undefined,
    };

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        invoice: {
          select: {
            id: true,
            clientId: true,
            totalAmount: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { payment },
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

// Eliminar pago
export async function deletePayment(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  // Verificar que el pago existe
  const existingPayment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!existingPayment) {
    throw new NotFoundError("Payment not found");
  }

  await prisma.payment.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: "Payment deleted successfully",
  });
}
