import { prisma } from "../config/prisma";
import { sendClientReminder } from "./email.service";
import { AppError } from "../utils/errors";

/**
 * Obtiene la fecha actual en Colombia (UTC-5) solo con la parte de fecha (sin hora)
 */
function getTodayDateColombia(): Date {
  const now = new Date();
  // Colombia está en UTC-5, así que restamos 5 horas
  const colombiaTime = new Date(now.getTime() - 5 * 60 * 60 * 1000);

  // Retornar solo la fecha (dd-mm-yyyy) sin la hora
  const year = colombiaTime.getUTCFullYear();
  const month = colombiaTime.getUTCMonth();
  const day = colombiaTime.getUTCDate();

  // Crear una nueva fecha en UTC para comparar solo la fecha
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

/**
 * Compara dos fechas solo por día, mes y año (ignora la hora)
 */
function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

/**
 * Procesa y envía los recordatorios del día actual
 */
export async function processDailyReminders(): Promise<void> {
  try {
    const today = getTodayDateColombia();

    // Buscar recordatorios que no han sido enviados y cuya fecha coincide con hoy
    const reminders = await prisma.reminder.findMany({
      where: {
        sentAt: null, // Solo los que no han sido enviados
      },
      orderBy: {
        date: "asc",
      },
    });

    // Filtrar por fecha (solo comparar dd-mm-yyyy)
    const todayReminders = reminders.filter((reminder) => {
      const reminderDate = new Date(reminder.date);
      // Normalizar la fecha del recordatorio para comparar solo día, mes y año
      const reminderDateNormalized = new Date(
        Date.UTC(
          reminderDate.getUTCFullYear(),
          reminderDate.getUTCMonth(),
          reminderDate.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
      return isSameDate(reminderDateNormalized, today);
    });

    if (todayReminders.length === 0) {
      console.log(
        `[Reminder Service] No hay recordatorios para enviar hoy (${
          today.toISOString().split("T")[0]
        })`
      );
      return;
    }

    console.log(
      `[Reminder Service] Encontrados ${todayReminders.length} recordatorio(s) para enviar hoy`
    );

    // Buscar el email del cliente en la base de datos
    for (const reminder of todayReminders) {
      try {
        // Buscar cliente por nombre
        const client = await prisma.client.findFirst({
          where: {
            name: reminder.clientName,
            email: {
              not: null,
            },
            deletedAt: null,
          },
          select: {
            email: true,
            name: true,
          },
        });

        if (!client || !client.email) {
          console.warn(
            `[Reminder Service] Cliente "${reminder.clientName}" no encontrado o no tiene email. Recordatorio ID: ${reminder.id}`
          );
          // Marcar como enviado aunque no se haya enviado realmente para evitar reintentos
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { sentAt: new Date() },
          });
          continue;
        }

        // Enviar el recordatorio por email
        await sendClientReminder(
          client.email,
          client.name || reminder.clientName,
          reminder.clientName,
          reminder.description
        );

        // Marcar como enviado
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { sentAt: new Date() },
        });

        console.log(
          `[Reminder Service] Recordatorio enviado exitosamente a ${client.email} para cliente ${reminder.clientName}`
        );
      } catch (error) {
        console.error(
          `[Reminder Service] Error al enviar recordatorio ID ${reminder.id}:`,
          error
        );
        // No marcamos como enviado si hay error, para que se reintente mañana
      }
    }

    console.log(`[Reminder Service] Proceso de recordatorios completado`);
  } catch (error) {
    console.error("[Reminder Service] Error al procesar recordatorios:", error);
    throw new AppError("Failed to process daily reminders", 500);
  }
}
