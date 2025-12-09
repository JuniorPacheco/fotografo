import * as brevo from "@getbrevo/brevo";
import { AppError } from "../utils/errors";
import { ENVIRONMENTS } from "../config/env";
import {
  getSessionReminderTemplate,
  getPaymentReminderTemplate,
  getDigitalPhotosPolicyReminderTemplate,
  getPaymentInvoiceTemplate,
  getClientReminderTemplate,
} from "./email.templates";

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
  const template = getSessionReminderTemplate({
    recipientName,
    clientName,
    sessionDate,
    sessionTime,
    sessionType,
  });

  return sendReminderEmail({
    to: {
      email: recipientEmail,
      name: recipientName,
    },
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
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
  const template = getPaymentReminderTemplate({
    recipientName,
    clientName,
    invoiceNumber,
    amount,
    dueDate,
  });

  return sendReminderEmail({
    to: {
      email: recipientEmail,
      name: recipientName,
    },
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
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
  const template = getDigitalPhotosPolicyReminderTemplate({
    recipientName,
    clientName,
    sessionDate,
    sessionTime,
    sessionNumber,
  });

  return sendReminderEmail({
    to: {
      email: recipientEmail,
      name: recipientName,
    },
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
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
  const template = getPaymentInvoiceTemplate({
    recipientName,
    clientName,
    paymentAmount,
    paymentDate,
    paymentMethod,
    invoiceTotal,
    totalPaid,
    remainingAmount,
    packageName,
    isUpdate,
  });

  return sendReminderEmail({
    to: {
      email: recipientEmail,
      name: recipientName,
    },
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
  });
}

async function sendClientReminder(
  recipientEmail: string,
  recipientName: string,
  clientName: string,
  description: string
): Promise<brevo.CreateSmtpEmail> {
  const template = getClientReminderTemplate({
    recipientName,
    clientName,
    description,
  });

  return sendReminderEmail({
    to: {
      email: recipientEmail,
      name: recipientName,
    },
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
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
  sendClientReminder,
};
