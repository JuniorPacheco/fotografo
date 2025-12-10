import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { PaymentMethod } from "../generated/prisma/enums";
import { NotFoundError, ValidationError, AppError } from "../utils/errors";
import { sendPaymentInvoice } from "../services/email.service";

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

    // Verificar que el invoice existe con información del cliente y paquete
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        package: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    // Calcular saldo restante antes de crear el pago
    const existingPayments = await prisma.payment.findMany({
      where: { invoiceId },
      select: { amount: true },
    });

    const totalPaid = existingPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const remainingAmount = Number(invoice.totalAmount) - totalPaid;

    // Validar que el monto del pago no exceda el saldo restante
    if (amount > remainingAmount) {
      throw new ValidationError(
        `El monto del pago (${amount.toFixed(
          2
        )}) no puede exceder el saldo restante (${remainingAmount.toFixed(2)})`
      );
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

    // Calcular total pagado después de crear el pago (sumar el nuevo pago al total anterior)
    const finalTotalPaid = totalPaid + amount;
    const finalRemainingAmount = Number(invoice.totalAmount) - finalTotalPaid;

    // Enviar factura de pago por email si el cliente tiene email
    if (invoice.client.email) {
      try {
        await sendPaymentInvoice(
          invoice.client.email,
          invoice.client.name,
          Number(payment.amount),
          parsedPaymentDate,
          payment.method,
          invoice.client.name,
          Number(invoice.totalAmount),
          finalTotalPaid,
          finalRemainingAmount,
          invoice.package?.name || null,
          false // isUpdate = false para creación
        );
      } catch (error) {
        // Log error but don't fail payment creation if email fails
        console.error("Failed to send payment invoice email:", error);
      }
    }

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
          package: {
            select: {
              id: true,
              name: true,
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

    // Verificar que el pago existe con información del invoice, cliente y paquete
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            package: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!existingPayment) {
      throw new NotFoundError("Payment not found");
    }

    // Validar monto si se está actualizando
    if (body.amount !== undefined) {
      // Calcular saldo restante considerando el monto actual del pago
      const allPayments = await prisma.payment.findMany({
        where: { invoiceId: existingPayment.invoiceId },
        select: { amount: true },
      });

      // Calcular total pagado excluyendo el pago actual
      const totalPaidExcludingCurrent = allPayments
        .filter((p) => p.amount !== existingPayment.amount)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      // Calcular nuevo total pagado con el monto actualizado
      const newTotalPaid = totalPaidExcludingCurrent + body.amount;
      const remainingAmount =
        Number(existingPayment.invoice.totalAmount) - newTotalPaid;

      // Validar que el nuevo monto no exceda el saldo restante
      if (remainingAmount < 0) {
        const maxAllowedAmount =
          Number(existingPayment.invoice.totalAmount) -
          totalPaidExcludingCurrent;
        throw new ValidationError(
          `El monto del pago (${body.amount.toFixed(
            2
          )}) no puede exceder el saldo restante. El monto máximo permitido es ${maxAllowedAmount.toFixed(
            2
          )}`
        );
      }
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

    // Calcular total pagado después de actualizar el pago
    const allPayments = await prisma.payment.findMany({
      where: { invoiceId: existingPayment.invoiceId },
      select: { amount: true },
    });

    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remainingAmount =
      Number(existingPayment.invoice.totalAmount) - totalPaid;

    // Enviar factura de pago actualizada por email si el cliente tiene email
    if (existingPayment.invoice.client.email) {
      try {
        const finalPaymentDate =
          updateData.paymentDate || existingPayment.paymentDate;
        const finalAmount =
          updateData.amount !== undefined
            ? updateData.amount
            : Number(existingPayment.amount);
        const finalMethod = updateData.method || existingPayment.method;

        await sendPaymentInvoice(
          existingPayment.invoice.client.email,
          existingPayment.invoice.client.name,
          finalAmount,
          finalPaymentDate,
          finalMethod,
          existingPayment.invoice.client.name,
          Number(existingPayment.invoice.totalAmount),
          totalPaid,
          remainingAmount,
          existingPayment.invoice.package?.name || null,
          true // isUpdate = true para actualización
        );
      } catch (error) {
        // Log error but don't fail payment update if email fails
        console.error("Failed to send payment invoice update email:", error);
      }
    }

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

// Obtener ventas del día
export async function getDailySales(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      throw new ValidationError("Date parameter is required");
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new ValidationError("Invalid date format. Use YYYY-MM-DD");
    }

    // Crear rango de fechas para el día completo en zona horaria de Colombia (UTC-5)
    // La fecha viene en formato YYYY-MM-DD, la interpretamos como fecha local de Colombia
    const [year, month, day] = date.split("-").map(Number);

    // Crear fecha de inicio del día en hora de Colombia (00:00:00)
    // Usamos UTC y luego ajustamos a Colombia (UTC-5)
    const startDate = new Date(Date.UTC(year, month - 1, day, 5, 0, 0, 0)); // 05:00 UTC = 00:00 Colombia

    // Crear fecha de fin del día en hora de Colombia (23:59:59.999)
    // 04:59:59.999 del día siguiente en UTC = 23:59:59.999 del día actual en Colombia
    const endDate = new Date(
      Date.UTC(year, month - 1, day + 1, 4, 59, 59, 999)
    );
    // Obtener todos los pagos del día con información del cliente e invoice
    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate,
        },
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
            package: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        paymentDate: "asc",
      },
    });

    // Calcular totales por método de pago
    const totalsByMethod = payments.reduce((acc, payment) => {
      const method = payment.method;
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += Number(payment.amount);
      return acc;
    }, {} as Record<string, number>);

    // Calcular total general
    const totalAmount = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    // Formatear datos de pagos
    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      method: payment.method,
      paymentDate: payment.paymentDate,
      notes: payment.notes,
      clientName: payment.invoice.client.name,
      clientPhone: payment.invoice.client.phone,
      packageName: payment.invoice.package?.name || null,
    }));

    res.status(200).json({
      success: true,
      data: {
        date,
        totalAmount,
        totalPayments: payments.length,
        totalsByMethod,
        payments: formattedPayments,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    console.error("Error getting daily sales:", error);
    throw new AppError("Failed to get daily sales", 500);
  }
}
