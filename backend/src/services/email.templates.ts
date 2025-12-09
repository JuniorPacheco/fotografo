interface SessionReminderTemplateData {
  recipientName: string;
  clientName: string;
  sessionDate: Date;
  sessionTime: string;
  sessionType?: string;
}

interface PaymentReminderTemplateData {
  recipientName: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
}

interface DigitalPhotosPolicyReminderTemplateData {
  recipientName: string;
  clientName: string;
  sessionDate: Date;
  sessionTime: string;
  sessionNumber: number;
}

interface PaymentInvoiceTemplateData {
  recipientName: string;
  clientName: string;
  paymentAmount: number;
  paymentDate: Date;
  paymentMethod: string;
  invoiceTotal: number;
  totalPaid: number;
  remainingAmount: number;
  packageName: string | null;
  isUpdate: boolean;
}

export function getSessionReminderTemplate(data: SessionReminderTemplateData): {
  htmlContent: string;
  textContent: string;
  subject: string;
} {
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(data.sessionDate);

  const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin-top: 0;">Recordatorio de Sesión</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <p>Hola <strong>${data.recipientName}</strong>,</p>
            
            <p>Te recordamos que tienes una sesión programada:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${
                data.clientName
              }</p>
              ${
                data.sessionType
                  ? `<p style="margin: 5px 0;"><strong>Tipo de sesión:</strong> ${data.sessionType}</p>`
                  : ""
              }
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${
                data.sessionTime
              }</p>
            </div>
            
            <p>Por favor, confirma tu asistencia o contacta si necesitas reprogramar.</p>
            
            <p style="margin-top: 30px;">Saludos,<br>Cabal Studios</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </body>
      </html>
    `;

  const textContent = `
Recordatorio de Sesión

Hola ${data.recipientName},

Te recordamos que tienes una sesión programada:

Cliente: ${data.clientName}
${
  data.sessionType ? `Tipo de sesión: ${data.sessionType}\n` : ""
}Fecha: ${formattedDate}
Hora: ${data.sessionTime}

Por favor, confirma tu asistencia o contacta si necesitas reprogramar.

Saludos,
Cabal Studios

---
Este es un correo automático, por favor no respondas a este mensaje.
    `.trim();

  return {
    htmlContent,
    textContent,
    subject: `Recordatorio: Sesión con ${data.clientName} - ${formattedDate}`,
  };
}

export function getPaymentReminderTemplate(data: PaymentReminderTemplateData): {
  htmlContent: string;
  textContent: string;
  subject: string;
} {
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(data.dueDate);

  const formattedAmount = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(data.amount);

  const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin-top: 0;">Recordatorio de Pago</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <p>Hola <strong>${data.recipientName}</strong>,</p>
            
            <p>Te recordamos que tienes un pago pendiente:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${data.clientName}</p>
              <p style="margin: 5px 0;"><strong>Factura:</strong> ${data.invoiceNumber}</p>
              <p style="margin: 5px 0;"><strong>Monto:</strong> ${formattedAmount}</p>
              <p style="margin: 5px 0;"><strong>Fecha de vencimiento:</strong> ${formattedDate}</p>
            </div>
            
            <p>Por favor, realiza el pago antes de la fecha de vencimiento.</p>
            
            <p style="margin-top: 30px;">Saludos,<br>Cabal Studios</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </body>
      </html>
    `;

  const textContent = `
Recordatorio de Pago

Hola ${data.recipientName},

Te recordamos que tienes un pago pendiente:

Cliente: ${data.clientName}
Factura: ${data.invoiceNumber}
Monto: ${formattedAmount}
Fecha de vencimiento: ${formattedDate}

Por favor, realiza el pago antes de la fecha de vencimiento.

Saludos,
Cabal Studios

---
Este es un correo automático, por favor no respondas a este mensaje.
    `.trim();

  return {
    htmlContent,
    textContent,
    subject: `Recordatorio de Pago: Factura ${data.invoiceNumber} - ${formattedAmount}`,
  };
}

export function getDigitalPhotosPolicyReminderTemplate(
  data: DigitalPhotosPolicyReminderTemplateData
): { htmlContent: string; textContent: string; subject: string } {
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(data.sessionDate);

  const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin-top: 0;">Información Importante sobre tu Sesión</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <p>Estimado/a <strong>${data.recipientName}</strong>,</p>
            
            <p>Nos complace confirmar tu sesión fotográfica programada:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${data.clientName}</p>
              <p style="margin: 5px 0;"><strong>Sesión:</strong> #${data.sessionNumber}</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${data.sessionTime}</p>
            </div>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: 600; color: #856404;">
                ⚠️ Información Importante sobre las Fotos Digitales
              </p>
            </div>
            
            <p style="margin-top: 20px;">
              Queremos informarte que <strong>las fotos digitales se entregarán únicamente cuando el paquete completo haya sido pagado en su totalidad</strong>. 
              Esto nos permite garantizar un proceso ordenado y eficiente para todos nuestros clientes.
            </p>
            
            <p>
              Una vez completado el pago total del paquete, recibirás todas las fotografías digitales en alta resolución 
              mediante el método de entrega acordado.
            </p>
            
            <p style="margin-top: 30px;">
              Si tienes alguna pregunta o necesitas más información sobre tu sesión o el proceso de pago, 
              no dudes en contactarnos.
            </p>
            
            <p style="margin-top: 30px;">
              Saludos cordiales,<br>
              <strong>Cabal Studios</strong>
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </body>
      </html>
    `;

  const textContent = `
Información Importante sobre tu Sesión

Estimado/a ${data.recipientName},

Nos complace confirmar tu sesión fotográfica programada:

Cliente: ${data.clientName}
Sesión: #${data.sessionNumber}
Fecha: ${formattedDate}
Hora: ${data.sessionTime}

⚠️ INFORMACIÓN IMPORTANTE SOBRE LAS FOTOS DIGITALES

Queremos informarte que las fotos digitales se entregarán únicamente cuando el paquete completo haya sido pagado en su totalidad. Esto nos permite garantizar un proceso ordenado y eficiente para todos nuestros clientes.

Una vez completado el pago total del paquete, recibirás todas las fotografías digitales en alta resolución mediante el método de entrega acordado.

Si tienes alguna pregunta o necesitas más información sobre tu sesión o el proceso de pago, no dudes en contactarnos.

Saludos cordiales,
Cabal Studios

---
Este es un correo automático, por favor no respondas a este mensaje.
    `.trim();

  return {
    htmlContent,
    textContent,
    subject: `Información Importante - Sesión #${data.sessionNumber} con ${data.clientName}`,
  };
}

export function getPaymentInvoiceTemplate(data: PaymentInvoiceTemplateData): {
  htmlContent: string;
  textContent: string;
  subject: string;
} {
  const formattedPaymentDate = new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data.paymentDate);

  const formattedPaymentAmount = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(data.paymentAmount);

  const formattedInvoiceTotal = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(data.invoiceTotal);

  const formattedTotalPaid = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(data.totalPaid);

  const formattedRemaining = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(data.remainingAmount);

  const methodLabels: Record<string, string> = {
    CASH: "Efectivo",
    TRANSFER: "Transferencia",
    CARD: "Tarjeta",
    OTHER: "Otro",
  };

  const paymentMethodLabel =
    methodLabels[data.paymentMethod] || data.paymentMethod;

  const updateNotice = data.isUpdate
    ? `
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: 600; color: #856404;">
                ⚠️ Este es un correo de actualización de pago
              </p>
              <p style="margin: 5px 0 0 0; color: #856404;">
                Se ha actualizado la información de un pago previamente registrado.
              </p>
            </div>
          `
    : "";

  const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin-top: 0;">${
              data.isUpdate ? "Actualización de" : ""
            } Factura de Pago</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <p>Estimado/a <strong>${data.recipientName}</strong>,</p>
            
            ${updateNotice}
            
            <p>${
              data.isUpdate
                ? "Te informamos sobre la actualización de un pago registrado:"
                : "Te confirmamos el registro de un nuevo pago:"
            }</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${
                data.clientName
              }</p>
              ${
                data.packageName
                  ? `<p style="margin: 5px 0;"><strong>Paquete:</strong> ${data.packageName}</p>`
                  : ""
              }
              <p style="margin: 5px 0;"><strong>Monto del Pago:</strong> ${formattedPaymentAmount}</p>
              <p style="margin: 5px 0;"><strong>Método de Pago:</strong> ${paymentMethodLabel}</p>
              <p style="margin: 5px 0;"><strong>Fecha de Pago:</strong> ${formattedPaymentDate}</p>
            </div>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="margin-top: 0; color: #2e7d32;">Resumen de Factura</h3>
              <p style="margin: 5px 0;"><strong>Total de la Factura:</strong> ${formattedInvoiceTotal}</p>
              <p style="margin: 5px 0;"><strong>Total Pagado:</strong> ${formattedTotalPaid}</p>
              <p style="margin: 5px 0; font-size: 1.1em; font-weight: 600; color: ${
                data.remainingAmount > 0 ? "#f57c00" : "#2e7d32"
              };">
                <strong>Saldo Pendiente:</strong> ${formattedRemaining}
              </p>
            </div>
            
            ${
              data.remainingAmount > 0
                ? `<p style="color: #f57c00; font-weight: 600;">Aún queda un saldo pendiente de ${formattedRemaining} por pagar.</p>`
                : `<p style="color: #2e7d32; font-weight: 600;">¡La factura ha sido pagada en su totalidad!</p>`
            }
            
            <p style="margin-top: 30px;">
              Si tienes alguna pregunta o necesitas más información sobre este pago, 
              no dudes en contactarnos.
            </p>
            
            <p style="margin-top: 30px;">
              Saludos cordiales,<br>
              <strong>Cabal Studios</strong>
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </body>
      </html>
    `;

  const textContent = `
${data.isUpdate ? "Actualización de " : ""}Factura de Pago

Estimado/a ${data.recipientName},

${
  data.isUpdate
    ? "Te informamos sobre la actualización de un pago registrado:"
    : "Te confirmamos el registro de un nuevo pago:"
}

${
  data.isUpdate
    ? "⚠️ Este es un correo de actualización de pago\nSe ha actualizado la información de un pago previamente registrado.\n"
    : ""
}Cliente: ${data.clientName}
${
  data.packageName ? `Paquete: ${data.packageName}\n` : ""
}Monto del Pago: ${formattedPaymentAmount}
Método de Pago: ${paymentMethodLabel}
Fecha de Pago: ${formattedPaymentDate}

RESUMEN DE FACTURA
Total de la Factura: ${formattedInvoiceTotal}
Total Pagado: ${formattedTotalPaid}
Saldo Pendiente: ${formattedRemaining}

${
  data.remainingAmount > 0
    ? `Aún queda un saldo pendiente de ${formattedRemaining} por pagar.`
    : "¡La factura ha sido pagada en su totalidad!"
}

Si tienes alguna pregunta o necesitas más información sobre este pago, no dudes en contactarnos.

Saludos cordiales,
Cabal Studios

---
Este es un correo automático, por favor no respondas a este mensaje.
    `.trim();

  return {
    htmlContent,
    textContent,
    subject: `${
      data.isUpdate ? "Actualización de " : ""
    }Factura de Pago - ${formattedPaymentAmount}`,
  };
}
