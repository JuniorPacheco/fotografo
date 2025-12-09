import * as brevo from "@getbrevo/brevo";
import { AppError } from "../utils/errors";
import { ENVIRONMENTS } from "../config/env";

interface EmailRecipient {
  email: string;
  name?: string;
}

interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  from?: EmailRecipient;
  replyTo?: EmailRecipient;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
}

interface SendReminderEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

// Singleton pattern funcional para la instancia de la API
let apiInstance: brevo.TransactionalEmailsApi | null = null;

function getApiInstance(): brevo.TransactionalEmailsApi {
  if (!apiInstance) {
    if (!ENVIRONMENTS.BREVO_API_KEY) {
      throw new AppError("BREVO_API_KEY is not configured", 500);
    }

    apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      ENVIRONMENTS.BREVO_API_KEY
    );
  }
  return apiInstance;
}

function getDefaultFrom(): EmailRecipient {
  return {
    email: ENVIRONMENTS.BREVO_FROM_EMAIL || "noreply@fotografo.com",
    name: ENVIRONMENTS.BREVO_FROM_NAME || "Fotografo",
  };
}

function normalizeRecipients(
  recipient: EmailRecipient | EmailRecipient[]
): brevo.SendSmtpEmailToInner[] {
  if (Array.isArray(recipient)) {
    return recipient.map((r) => ({
      email: r.email,
      name: r.name,
    }));
  }
  return [
    {
      email: recipient.email,
      name: recipient.name,
    },
  ];
}

async function sendEmail(
  options: SendEmailOptions
): Promise<brevo.CreateSmtpEmail> {
  try {
    const api = getApiInstance();
    const defaultFrom = getDefaultFrom();
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.to = normalizeRecipients(options.to);
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.htmlContent;

    if (options.textContent) {
      sendSmtpEmail.textContent = options.textContent;
    }

    sendSmtpEmail.sender = options.from
      ? {
          email: options.from.email,
          name: options.from.name,
        }
      : {
          email: defaultFrom.email,
          name: defaultFrom.name,
        };

    if (options.replyTo) {
      sendSmtpEmail.replyTo = {
        email: options.replyTo.email,
        name: options.replyTo.name,
      };
    }

    if (options.cc && options.cc.length > 0) {
      sendSmtpEmail.cc = options.cc.map((r) => ({
        email: r.email,
        name: r.name,
      }));
    }

    if (options.bcc && options.bcc.length > 0) {
      sendSmtpEmail.bcc = options.bcc.map((r) => ({
        email: r.email,
        name: r.name,
      }));
    }

    const response = await api.sendTransacEmail(sendSmtpEmail);
    return response.body;
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(`Failed to send email: ${error.message}`, 500, false);
    }
    throw new AppError("Failed to send email: Unknown error", 500, false);
  }
}

async function sendReminderEmail(
  options: SendReminderEmailOptions
): Promise<brevo.CreateSmtpEmail> {
  return sendEmail({
    to: options.to,
    subject: options.subject,
    htmlContent: options.htmlContent,
    textContent: options.textContent,
  });
}

async function sendSessionReminder(
  recipientEmail: string,
  recipientName: string,
  sessionDate: Date,
  sessionTime: string,
  clientName: string,
  sessionType?: string
): Promise<brevo.CreateSmtpEmail> {
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(sessionDate);

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
            <p>Hola <strong>${recipientName}</strong>,</p>
            
            <p>Te recordamos que tienes una sesión programada:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${clientName}</p>
              ${
                sessionType
                  ? `<p style="margin: 5px 0;"><strong>Tipo de sesión:</strong> ${sessionType}</p>`
                  : ""
              }
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${sessionTime}</p>
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

Hola ${recipientName},

Te recordamos que tienes una sesión programada:

Cliente: ${clientName}
${sessionType ? `Tipo de sesión: ${sessionType}\n` : ""}Fecha: ${formattedDate}
Hora: ${sessionTime}

Por favor, confirma tu asistencia o contacta si necesitas reprogramar.

Saludos,
Cabal Studios

---
Este es un correo automático, por favor no respondas a este mensaje.
    `.trim();

  return sendReminderEmail({
    to: {
      email: recipientEmail,
      name: recipientName,
    },
    subject: `Recordatorio: Sesión con ${clientName} - ${formattedDate}`,
    htmlContent,
    textContent,
  });
}

async function sendPaymentReminder(
  recipientEmail: string,
  recipientName: string,
  invoiceNumber: string,
  amount: number,
  dueDate: Date,
  clientName: string
): Promise<brevo.CreateSmtpEmail> {
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dueDate);

  const formattedAmount = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);

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
            <p>Hola <strong>${recipientName}</strong>,</p>
            
            <p>Te recordamos que tienes un pago pendiente:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${clientName}</p>
              <p style="margin: 5px 0;"><strong>Factura:</strong> ${invoiceNumber}</p>
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

Hola ${recipientName},

Te recordamos que tienes un pago pendiente:

Cliente: ${clientName}
Factura: ${invoiceNumber}
Monto: ${formattedAmount}
Fecha de vencimiento: ${formattedDate}

Por favor, realiza el pago antes de la fecha de vencimiento.

Saludos,
Cabal Studios

---
Este es un correo automático, por favor no respondas a este mensaje.
    `.trim();

  return sendReminderEmail({
    to: {
      email: recipientEmail,
      name: recipientName,
    },
    subject: `Recordatorio de Pago: Factura ${invoiceNumber} - ${formattedAmount}`,
    htmlContent,
    textContent,
  });
}

async function sendDigitalPhotosPolicyReminder(
  recipientEmail: string,
  recipientName: string,
  sessionDate: Date,
  sessionTime: string,
  clientName: string,
  sessionNumber: number
): Promise<brevo.CreateSmtpEmail> {
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(sessionDate);

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
            <p>Estimado/a <strong>${recipientName}</strong>,</p>
            
            <p>Nos complace confirmar tu sesión fotográfica programada:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${clientName}</p>
              <p style="margin: 5px 0;"><strong>Sesión:</strong> #${sessionNumber}</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${sessionTime}</p>
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

Estimado/a ${recipientName},

Nos complace confirmar tu sesión fotográfica programada:

Cliente: ${clientName}
Sesión: #${sessionNumber}
Fecha: ${formattedDate}
Hora: ${sessionTime}

⚠️ INFORMACIÓN IMPORTANTE SOBRE LAS FOTOS DIGITALES

Queremos informarte que las fotos digitales se entregarán únicamente cuando el paquete completo haya sido pagado en su totalidad. Esto nos permite garantizar un proceso ordenado y eficiente para todos nuestros clientes.

Una vez completado el pago total del paquete, recibirás todas las fotografías digitales en alta resolución mediante el método de entrega acordado.

Si tienes alguna pregunta o necesitas más información sobre tu sesión o el proceso de pago, no dudes en contactarnos.

Saludos cordiales,
Cabal Studios

---
Este es un correo automático, por favor no respondas a este mensaje.
    `.trim();

  return sendReminderEmail({
    to: {
      email: recipientEmail,
      name: recipientName,
    },
    subject: `Información Importante - Sesión #${sessionNumber} con ${clientName}`,
    htmlContent,
    textContent,
  });
}

async function sendPaymentInvoice(
  recipientEmail: string,
  recipientName: string,
  paymentAmount: number,
  paymentDate: Date,
  paymentMethod: string,
  clientName: string,
  invoiceTotal: number,
  totalPaid: number,
  remainingAmount: number,
  packageName: string | null,
  isUpdate: boolean = false
): Promise<brevo.CreateSmtpEmail> {
  const formattedPaymentDate = new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(paymentDate);

  const formattedPaymentAmount = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(paymentAmount);

  const formattedInvoiceTotal = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(invoiceTotal);

  const formattedTotalPaid = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(totalPaid);

  const formattedRemaining = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(remainingAmount);

  const methodLabels: Record<string, string> = {
    CASH: "Efectivo",
    TRANSFER: "Transferencia",
    CARD: "Tarjeta",
    OTHER: "Otro",
  };

  const paymentMethodLabel = methodLabels[paymentMethod] || paymentMethod;

  const updateNotice = isUpdate
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
              isUpdate ? "Actualización de" : ""
            } Factura de Pago</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <p>Estimado/a <strong>${recipientName}</strong>,</p>
            
            ${updateNotice}
            
            <p>${
              isUpdate
                ? "Te informamos sobre la actualización de un pago registrado:"
                : "Te confirmamos el registro de un nuevo pago:"
            }</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${clientName}</p>
              ${
                packageName
                  ? `<p style="margin: 5px 0;"><strong>Paquete:</strong> ${packageName}</p>`
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
                remainingAmount > 0 ? "#f57c00" : "#2e7d32"
              };">
                <strong>Saldo Pendiente:</strong> ${formattedRemaining}
              </p>
            </div>
            
            ${
              remainingAmount > 0
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
${isUpdate ? "Actualización de " : ""}Factura de Pago

Estimado/a ${recipientName},

${
  isUpdate
    ? "Te informamos sobre la actualización de un pago registrado:"
    : "Te confirmamos el registro de un nuevo pago:"
}

${
  isUpdate
    ? "⚠️ Este es un correo de actualización de pago\nSe ha actualizado la información de un pago previamente registrado.\n"
    : ""
}Cliente: ${clientName}
${
  packageName ? `Paquete: ${packageName}\n` : ""
}Monto del Pago: ${formattedPaymentAmount}
Método de Pago: ${paymentMethodLabel}
Fecha de Pago: ${formattedPaymentDate}

RESUMEN DE FACTURA
Total de la Factura: ${formattedInvoiceTotal}
Total Pagado: ${formattedTotalPaid}
Saldo Pendiente: ${formattedRemaining}

${
  remainingAmount > 0
    ? `Aún queda un saldo pendiente de ${formattedRemaining} por pagar.`
    : "¡La factura ha sido pagada en su totalidad!"
}

Si tienes alguna pregunta o necesitas más información sobre este pago, no dudes en contactarnos.

Saludos cordiales,
Cabal Studios

---
Este es un correo automático, por favor no respondas a este mensaje.
    `.trim();

  return sendReminderEmail({
    to: {
      email: recipientEmail,
      name: recipientName,
    },
    subject: `${
      isUpdate ? "Actualización de " : ""
    }Factura de Pago - ${formattedPaymentAmount}`,
    htmlContent,
    textContent,
  });
}

// Exportar funciones directamente
export {
  sendEmail,
  sendReminderEmail,
  sendSessionReminder,
  sendPaymentReminder,
  sendDigitalPhotosPolicyReminder,
  sendPaymentInvoice,
};
