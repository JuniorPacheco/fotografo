/**
 * Utilidades para manejo de fechas considerando la zona horaria de Colombia (America/Bogota, UTC-5)
 * La aplicación siempre se usa en Colombia, por lo que todas las fechas se interpretan en esta zona horaria
 */

/**
 * Convierte un valor datetime-local a ISO string considerando zona horaria de Colombia
 * @param dateTimeLocal - Fecha en formato "YYYY-MM-DDTHH:mm" (formato datetime-local)
 * @returns Fecha en formato ISO string (UTC)
 */
export function convertToColombiaISO(dateTimeLocal: string): string {
  // El formato datetime-local es "YYYY-MM-DDTHH:mm"
  // Lo interpretamos como hora de Colombia (America/Bogota, UTC-5)
  // Agregamos segundos y el offset de Colombia para crear un string ISO válido
  const dateTimeWithOffset = `${dateTimeLocal}:00-05:00`;
  const date = new Date(dateTimeWithOffset);
  return date.toISOString();
}

/**
 * Convierte un ISO string a formato datetime-local para inputs HTML
 * @param isoString - Fecha en formato ISO string
 * @returns Fecha en formato "YYYY-MM-DDTHH:mm" (formato datetime-local) en hora de Colombia
 */
export function convertFromISOToLocal(isoString: string): string {
  // Convertir ISO a hora de Colombia usando Intl.DateTimeFormat
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  const hours = parts.find((p) => p.type === "hour")?.value;
  const minutes = parts.find((p) => p.type === "minute")?.value;

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Formatea una fecha para mostrar al usuario en formato legible en español de Colombia
 * @param dateString - Fecha en formato ISO string o null
 * @returns Fecha formateada en español de Colombia o "-" si es null
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
}

/**
 * Formatea una fecha para mostrar solo la fecha (sin hora) en español de Colombia
 * @param dateString - Fecha en formato ISO string
 * @returns Fecha formateada en español de Colombia
 */
export function formatDateOnly(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Bogota",
  });
}

/**
 * Formatea una fecha para mostrar solo la hora en español de Colombia
 * @param dateString - Fecha en formato ISO string
 * @returns Hora formateada en español de Colombia
 */
export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
}

/**
 * Formatea una fecha para mostrar en formato corto (mes abreviado) en español de Colombia
 * @param dateString - Fecha en formato ISO string o null
 * @returns Fecha formateada en formato corto o "-" si es null
 */
export function formatDateShort(dateString: string | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
}
