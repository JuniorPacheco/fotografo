import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { SessionStatus } from "../generated/prisma/enums";
import { NotFoundError, ValidationError } from "../utils/errors";
import { createEvent, updateEvent, deleteEvent } from "../utils/googleCalendar";

// Schemas de validación
const createSessionSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID"),
  sessionNumber: z.number().int().positive().optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z
    .enum([
      SessionStatus.SCHEDULED,
      SessionStatus.COMPLETED,
      SessionStatus.CANCELLED,
    ])
    .optional(),
  selectedPhotos: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
});

const updateSessionSchema = z.object({
  sessionNumber: z.number().int().positive().optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  status: z
    .enum([
      SessionStatus.SCHEDULED,
      SessionStatus.COMPLETED,
      SessionStatus.CANCELLED,
    ])
    .optional(),
  selectedPhotos: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

// Crear sesión
export async function createSession(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const body = createSessionSchema.parse(req.body);
    const {
      invoiceId,
      sessionNumber,
      scheduledAt,
      status,
      selectedPhotos,
      notes,
    } = body;

    // Verificar que el invoice existe con información del cliente
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
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

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    // Contar sesiones existentes para este invoice
    const existingSessionsCount = await prisma.session.count({
      where: { invoiceId },
    });

    // Verificar que no se exceda el límite
    if (existingSessionsCount >= invoice.maxNumberSessions) {
      throw new ValidationError(
        `Maximum number of sessions (${invoice.maxNumberSessions}) reached for this invoice`
      );
    }

    // Si no se proporciona sessionNumber, calcularlo automáticamente
    let finalSessionNumber = sessionNumber;
    if (!finalSessionNumber) {
      // Obtener el número de sesión más alto y sumarle 1
      const lastSession = await prisma.session.findFirst({
        where: { invoiceId },
        orderBy: { sessionNumber: "desc" },
      });
      finalSessionNumber = lastSession ? lastSession.sessionNumber + 1 : 1;
    } else {
      // Verificar que el sessionNumber no esté duplicado
      const existingSession = await prisma.session.findFirst({
        where: {
          invoiceId,
          sessionNumber: finalSessionNumber,
        },
      });

      if (existingSession) {
        throw new ValidationError(
          `Session number ${finalSessionNumber} already exists for this invoice`
        );
      }
    }

    // Parsear scheduledAt si existe
    const parsedScheduledAt = scheduledAt ? new Date(scheduledAt) : null;

    // Validar que no haya fotos duplicadas
    const finalSelectedPhotos = selectedPhotos || [];
    const uniquePhotos = Array.from(new Set(finalSelectedPhotos));
    if (uniquePhotos.length !== finalSelectedPhotos.length) {
      throw new ValidationError(
        "No se permiten fotos duplicadas en selectedPhotos"
      );
    }

    let googleEventId: string | null = null;

    // Crear evento en Google Calendar si hay scheduledAt y está programada
    if (parsedScheduledAt && (status === "SCHEDULED" || !status)) {
      try {
        // Calcular fecha de fin (1 hora después por defecto)
        const endDate = new Date(parsedScheduledAt);
        endDate.setHours(endDate.getHours() + 1);

        const eventDescription = [
          `Cliente: ${invoice.client.name}`,
          `Teléfono: ${invoice.client.phone}`,
          `Sesión #${finalSessionNumber}`,
          invoice.notes ? `Notas: ${invoice.notes}` : null,
          notes ? `Notas de sesión: ${notes}` : null,
        ]
          .filter(Boolean)
          .join("\n");

        const calendarEvent = await createEvent({
          summary: `Sesión Fotográfica - ${invoice.client.name}`,
          description: eventDescription,
          start: {
            dateTime: parsedScheduledAt.toISOString(),
            timeZone: "America/Bogota",
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: "America/Bogota",
          },
          reminders: {
            useDefault: true,
          },
        });

        googleEventId = calendarEvent.id || null;
      } catch (error) {
        // Log error but don't fail session creation if calendar fails
        console.error("Failed to create Google Calendar event:", error);
      }
    }

    const session = await prisma.session.create({
      data: {
        invoiceId,
        sessionNumber: finalSessionNumber,
        scheduledAt: parsedScheduledAt,
        status: status || "SCHEDULED",
        selectedPhotos: uniquePhotos,
        notes: notes || null,
        googleEventId,
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
      data: { session },
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

// Obtener sesiones de un invoice
export async function getSessionsByInvoice(
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

  const sessions = await prisma.session.findMany({
    where: { invoiceId },
    orderBy: {
      sessionNumber: "asc",
    },
    include: {
      invoice: {
        select: {
          id: true,
          clientId: true,
          maxNumberSessions: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: {
      sessions,
      invoice: {
        id: invoice.id,
        maxNumberSessions: invoice.maxNumberSessions,
        totalSessions: sessions.length,
        remainingSessions: invoice.maxNumberSessions - sessions.length,
      },
    },
  });
}

// Obtener sesión por ID
export async function getSessionById(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  const session = await prisma.session.findUnique({
    where: { id },
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
  });

  if (!session) {
    throw new NotFoundError("Session not found");
  }

  res.status(200).json({
    success: true,
    data: { session },
  });
}

// Actualizar sesión
export async function updateSession(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const body = updateSessionSchema.parse(req.body);

    // Verificar que la sesión existe con información del invoice y cliente
    const existingSession = await prisma.session.findUnique({
      where: { id },
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
    });

    if (!existingSession) {
      throw new NotFoundError("Session not found");
    }

    // Si se actualiza sessionNumber, verificar que no esté duplicado
    if (
      body.sessionNumber !== undefined &&
      body.sessionNumber !== existingSession.sessionNumber
    ) {
      const duplicateSession = await prisma.session.findFirst({
        where: {
          invoiceId: existingSession.invoiceId,
          sessionNumber: body.sessionNumber,
          id: { not: id },
        },
      });

      if (duplicateSession) {
        throw new ValidationError(
          `Session number ${body.sessionNumber} already exists for this invoice`
        );
      }
    }

    // Parsear scheduledAt si existe
    const parsedScheduledAt = body.scheduledAt
      ? new Date(body.scheduledAt)
      : null;

    // Validar que no haya fotos duplicadas si se actualiza selectedPhotos
    let finalSelectedPhotos: string[] | undefined = undefined;
    if (body.selectedPhotos !== undefined) {
      finalSelectedPhotos = body.selectedPhotos;
      const uniquePhotos = Array.from(new Set(finalSelectedPhotos));
      if (uniquePhotos.length !== finalSelectedPhotos.length) {
        throw new ValidationError(
          "No se permiten fotos duplicadas en selectedPhotos"
        );
      }
      finalSelectedPhotos = uniquePhotos;
    }

    const updateData: {
      sessionNumber?: number;
      scheduledAt?: Date | null;
      status?: SessionStatus;
      selectedPhotos?: string[];
      notes?: string | null;
      googleEventId?: string | null;
    } = {
      ...body,
      scheduledAt: parsedScheduledAt,
      selectedPhotos: finalSelectedPhotos,
    };

    // Manejar Google Calendar events
    const hasScheduledAt = parsedScheduledAt !== null;
    const isScheduled =
      body.status === "SCHEDULED" ||
      (!body.status && existingSession.status === "SCHEDULED");
    const shouldHaveEvent = hasScheduledAt && isScheduled;
    const hadEvent = existingSession.googleEventId !== null;

    if (shouldHaveEvent) {
      // Crear o actualizar evento
      try {
        const endDate = new Date(parsedScheduledAt);
        endDate.setHours(endDate.getHours() + 1);

        const eventDescription = [
          `Cliente: ${existingSession.invoice.client.name}`,
          `Teléfono: ${existingSession.invoice.client.phone}`,
          `Sesión #${body.sessionNumber ?? existingSession.sessionNumber}`,
          existingSession.invoice.notes
            ? `Notas: ${existingSession.invoice.notes}`
            : null,
          body.notes !== undefined
            ? body.notes
              ? `Notas de sesión: ${body.notes}`
              : null
            : existingSession.notes
            ? `Notas de sesión: ${existingSession.notes}`
            : null,
          finalSelectedPhotos?.length
            ? `Fotos: ${finalSelectedPhotos.join(", ")}`
            : null,
        ]
          .filter(Boolean)
          .join("\n");

        if (hadEvent && existingSession.googleEventId) {
          // Actualizar evento existente
          await updateEvent(existingSession.googleEventId, {
            summary: `Sesión Fotográfica - ${existingSession.invoice.client.name}`,
            description: eventDescription,
            start: {
              dateTime: parsedScheduledAt.toISOString(),
              timeZone: "America/Bogota",
            },
            end: {
              dateTime: endDate.toISOString(),
              timeZone: "America/Bogota",
            },
          });
        } else {
          // Crear nuevo evento
          const calendarEvent = await createEvent({
            summary: `Sesión Fotográfica - ${existingSession.invoice.client.name}`,
            description: eventDescription,
            start: {
              dateTime: parsedScheduledAt.toISOString(),
              timeZone: "America/Bogota",
            },
            end: {
              dateTime: endDate.toISOString(),
              timeZone: "America/Bogota",
            },
            reminders: {
              useDefault: true,
            },
          });
          updateData.googleEventId = calendarEvent.id || null;
        }
      } catch (error) {
        console.error("Failed to sync Google Calendar event:", error);
        // Continue with update even if calendar fails
      }
    } else if (hadEvent && existingSession.googleEventId) {
      // Eliminar evento si ya no debe tenerlo
      try {
        await deleteEvent(existingSession.googleEventId);
        updateData.googleEventId = null;
      } catch (error) {
        console.error("Failed to delete Google Calendar event:", error);
        // Continue with update even if calendar deletion fails
      }
    }

    const session = await prisma.session.update({
      where: { id },
      data: updateData,
      include: {
        invoice: {
          select: {
            id: true,
            clientId: true,
            maxNumberSessions: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { session },
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

// Eliminar sesión
export async function deleteSession(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  // Verificar que la sesión existe
  const existingSession = await prisma.session.findUnique({
    where: { id },
  });

  if (!existingSession) {
    throw new NotFoundError("Session not found");
  }

  // Eliminar evento de Google Calendar si existe
  if (existingSession.googleEventId) {
    try {
      await deleteEvent(existingSession.googleEventId);
    } catch (error) {
      console.error("Failed to delete Google Calendar event:", error);
      // Continue with deletion even if calendar deletion fails
    }
  }

  await prisma.session.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: "Session deleted successfully",
  });
}
