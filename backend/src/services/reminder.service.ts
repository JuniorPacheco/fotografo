import { prisma } from "../config/prisma";
import { sendClientReminder } from "./email.service";
import { AppError } from "../utils/errors";

/**
 * Constante para identificar recordatorios de sesiones completadas
 */
const SESSION_COMPLETED_REMINDER_DESCRIPTION =
  "Recordatorio: Tiene un trabajo pendiente por recoger en Cabal Studios.";

/**
 * Calcula la fecha para el recordatorio (15 días después de hoy)
 */
function calculateReminderDate(): Date {
  const today = new Date();
  const reminderDate = new Date(today);
  reminderDate.setDate(today.getDate() + 15);
  // Normalizar a medianoche para comparaciones de fecha
  reminderDate.setHours(0, 0, 0, 0);
  return reminderDate;
}

/**
 * Calcula la fecha para el recordatorio de fotos listas (3 meses después de hoy)
 */
function calculatePhotosReady3MonthsDate(): Date {
  const today = new Date();
  const reminderDate = new Date(today);
  reminderDate.setMonth(today.getMonth() + 3);
  // Normalizar a medianoche para comparaciones de fecha
  reminderDate.setHours(0, 0, 0, 0);
  return reminderDate;
}

/**
 * Calcula la fecha para el recordatorio de fotos listas (10 meses después de hoy)
 */
function calculatePhotosReady10MonthsDate(): Date {
  const today = new Date();
  const reminderDate = new Date(today);
  reminderDate.setMonth(today.getMonth() + 10);
  // Normalizar a medianoche para comparaciones de fecha
  reminderDate.setHours(0, 0, 0, 0);
  return reminderDate;
}

/**
 * Elimina recordatorios anteriores de sesiones completadas para una sesión específica
 * que aún no han sido enviados
 */
async function deletePendingSessionReminders(sessionId: string): Promise<void> {
  try {
    await prisma.reminder.deleteMany({
      where: {
        sessionId,
        type: "SESSION_COMPLETED",
      },
    });
  } catch (error) {
    console.error(
      `[Reminder Service] Error al eliminar recordatorios anteriores para sessionId ${sessionId}:`,
      error
    );
    // No lanzar error, solo loguear
  }
}

/**
 * Elimina todos los recordatorios asociados a una sesión específica
 * Se usa cuando una sesión cambia a COMPLETED_AND_CLAIMED
 * @param sessionId - ID de la sesión relacionada
 */
export async function deleteSessionReminders(sessionId: string): Promise<void> {
  try {
    const deletedCount = await prisma.reminder.deleteMany({
      where: {
        sessionId,
      },
    });

    console.log(
      `[Reminder Service] Eliminados ${deletedCount.count} recordatorio(s) para sessionId ${sessionId}`
    );
  } catch (error) {
    console.error(
      `[Reminder Service] Error al eliminar recordatorios para sessionId ${sessionId}:`,
      error
    );
    // No lanzar error para no interrumpir el flujo de actualización de sesión
  }
}

/**
 * Crea un recordatorio para una sesión completada
 * @param clientName - Nombre del cliente
 * @param sessionId - ID de la sesión relacionada
 * @returns El recordatorio creado
 */
export async function createSessionCompletedReminder(
  clientName: string,
  sessionId: string
): Promise<void> {
  try {
    // Eliminar recordatorios anteriores pendientes para esta sesión específica
    await deletePendingSessionReminders(sessionId);

    // Calcular la fecha del recordatorio (15 días después)
    const reminderDate = calculateReminderDate();

    // Crear el nuevo recordatorio
    await prisma.reminder.create({
      data: {
        date: reminderDate,
        clientName,
        description: SESSION_COMPLETED_REMINDER_DESCRIPTION,
        type: "SESSION_COMPLETED",
        sessionId,
        isSent: false,
      },
    });
  } catch (error) {
    console.error(
      `[Reminder Service] Error al crear recordatorio de sesión completada para ${clientName} (sessionId: ${sessionId}):`,
      error
    );
    // No lanzar error para no interrumpir el flujo de creación/actualización de sesión
  }
}

/**
 * Elimina recordatorios anteriores de fotos listas para una factura específica
 * que aún no han sido enviados
 */
async function deletePendingPhotosReadyReminders(
  invoiceId: string
): Promise<void> {
  try {
    await prisma.reminder.deleteMany({
      where: {
        invoiceId,
        type: {
          in: ["PHOTOS_READY_3_MONTHS", "PHOTOS_READY_10_MONTHS"],
        },
      },
    });
  } catch (error) {
    console.error(
      `[Reminder Service] Error al eliminar recordatorios anteriores de fotos listas para invoice ${invoiceId}:`,
      error
    );
    // No lanzar error, solo loguear
  }
}

/**
 * Crea recordatorios para cuando las fotos están listas (3 meses y 10 meses)
 * @param invoiceId - ID de la factura
 * @param clientName - Nombre del cliente
 */
export async function createPhotosReadyReminders(
  invoiceId: string,
  clientName: string
): Promise<void> {
  try {
    // Eliminar recordatorios anteriores pendientes para esta factura
    await deletePendingPhotosReadyReminders(invoiceId);

    // Calcular las fechas de los recordatorios
    const reminderDate3Months = calculatePhotosReady3MonthsDate();
    const reminderDate10Months = calculatePhotosReady10MonthsDate();

    // Crear mensajes sutiles y profesionales
    const reminder3MonthsDescription = `${clientName}, esperamos que se encuentre muy bien. Queremos contarle que sus fotografías ya están listas y lo esperan en Cabal Studios. Recuerde que podemos almacenarlas hasta por un máximo de 10 meses, así que puede pasar a recogerlas cuando le quede cómodo. Estaremos encantados de atenderle.`;

    const reminder10MonthsDescription = `${clientName}, le saludamos desde Cabal Studios. Queremos informarle que hemos llegado al tiempo máximo de almacenamiento de sus fotografías, por lo que pronto dejaremos de conservarlas. Agradecemos mucho su comprensión y quedamos atentos si necesita algo adicional.`;

    // Crear el recordatorio de 3 meses
    await prisma.reminder.create({
      data: {
        date: reminderDate3Months,
        clientName,
        description: reminder3MonthsDescription,
        type: "PHOTOS_READY_3_MONTHS",
        invoiceId,
        isSent: false,
      },
    });

    // Crear el recordatorio de 10 meses
    await prisma.reminder.create({
      data: {
        date: reminderDate10Months,
        clientName,
        description: reminder10MonthsDescription,
        type: "PHOTOS_READY_10_MONTHS",
        invoiceId,
        isSent: false,
      },
    });

    console.log(
      `[Reminder Service] Recordatorios de fotos listas creados para invoice ${invoiceId} (${clientName}) - 3 y 10 meses`
    );
  } catch (error) {
    console.error(
      `[Reminder Service] Error al crear recordatorios de fotos listas para invoice ${invoiceId}:`,
      error
    );
    // No lanzar error para no interrumpir el flujo de actualización de factura
  }
}

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
            deletedAt: null,
          },
          select: {
            email: true,
            name: true,
          },
        });

        // Validar que el cliente existe y tiene un email válido (no null, undefined ni string vacío)
        if (!client || !client.email || client.email.trim() === "") {
          console.warn(
            `[Reminder Service] Cliente "${reminder.clientName}" no encontrado o no tiene email válido. Recordatorio ID: ${reminder.id}`
          );
          // Marcar como enviado aunque no se haya enviado realmente para evitar reintentos
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { sentAt: new Date(), isSent: true },
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
          data: { sentAt: new Date(), isSent: true },
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
