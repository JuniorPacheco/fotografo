import { Request, Response } from "express";
import { prisma } from "../config/prisma";

// Obtener todos los recordatorios con paginación y filtros
export async function getReminders(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const where: {
    clientName?: { contains: string; mode: "insensitive" };
    date?: { gte?: Date; lte?: Date };
  } = {};

  // Filtro por nombre de cliente
  if (req.query.clientName && typeof req.query.clientName === "string") {
    where.clientName = {
      contains: req.query.clientName,
      mode: "insensitive",
    };
  }

  // Filtro por rango de fechas
  if (req.query.startDate && typeof req.query.startDate === "string") {
    where.date = {
      ...where.date,
      gte: new Date(req.query.startDate),
    };
  }

  if (req.query.endDate && typeof req.query.endDate === "string") {
    where.date = {
      ...where.date,
      lte: new Date(req.query.endDate),
    };
  }

  const [reminders, total] = await Promise.all([
    prisma.reminder.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        date: "asc",
      },
    }),
    prisma.reminder.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      reminders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}
