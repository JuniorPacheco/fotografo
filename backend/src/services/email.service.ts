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

class EmailService {
  private apiInstance: brevo.TransactionalEmailsApi;
  private defaultFrom: EmailRecipient;

  constructor() {
    if (!ENVIRONMENTS.BREVO_API_KEY) {
      throw new AppError("BREVO_API_KEY is not configured", 500);
    }

    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      ENVIRONMENTS.BREVO_API_KEY
    );

    this.defaultFrom = {
      email: ENVIRONMENTS.BREVO_FROM_EMAIL || "noreply@fotografo.com",
      name: ENVIRONMENTS.BREVO_FROM_NAME || "Fotografo",
    };
  }

  private normalizeRecipients(
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

  async sendEmail(options: SendEmailOptions): Promise<brevo.CreateSmtpEmail> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.to = this.normalizeRecipients(options.to);
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
            email: this.defaultFrom.email,
            name: this.defaultFrom.name,
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

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      return response.body;
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(
          `Failed to send email: ${error.message}`,
          500,
          false
        );
      }
      throw new AppError("Failed to send email: Unknown error", 500, false);
    }
  }

  async sendReminderEmail(
    options: SendReminderEmailOptions
  ): Promise<brevo.CreateSmtpEmail> {
    return this.sendEmail({
      to: options.to,
      subject: options.subject,
      htmlContent: options.htmlContent,
      textContent: options.textContent,
    });
  }

  async sendSessionReminder(
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
            
            <p style="margin-top: 30px;">Saludos,<br>El equipo de Fotografo</p>
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
El equipo de Fotografo

---
Este es un correo automático, por favor no respondas a este mensaje.
    `.trim();

    return this.sendReminderEmail({
      to: {
        email: recipientEmail,
        name: recipientName,
      },
      subject: `Recordatorio: Sesión con ${clientName} - ${formattedDate}`,
      htmlContent,
      textContent,
    });
  }

  async sendPaymentReminder(
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
            
            <p style="margin-top: 30px;">Saludos,<br>El equipo de Fotografo</p>
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
El equipo de Fotografo

---
Este es un correo automático, por favor no respondas a este mensaje.
    `.trim();

    return this.sendReminderEmail({
      to: {
        email: recipientEmail,
        name: recipientName,
      },
      subject: `Recordatorio de Pago: Factura ${invoiceNumber} - ${formattedAmount}`,
      htmlContent,
      textContent,
    });
  }
}

let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

export { EmailService };
