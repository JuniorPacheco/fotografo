import axios from "axios";
import { ENVIRONMENTS } from "../config/env";
import { AppError } from "../utils/errors";

/**
 * Envía un mensaje de recordatorio por WhatsApp usando un template
 * @param phoneNumber - Número de teléfono del destinatario (formato internacional sin +)
 * @param templateName - Nombre del template creado en Facebook
 * @param languageCode - Código de idioma del template (default: "es_MX")
 * @param components - Componentes opcionales del template (header, body, buttons)
 */
export const sendWhatsappReminderMessage = async (
  phoneNumber: string,
  templateName: string,
  languageCode: string = "es_MX",
  components?: Array<{
    type: "header" | "body" | "button";
    parameters?: Array<{
      type: "text" | "image" | "video" | "document";
      text?: string;
      image?: { link: string };
      video?: { link: string };
      document?: { link: string };
    }>;
  }>
): Promise<boolean> => {
  try {
    if (!ENVIRONMENTS.PHONE_NUMBER_ID) {
      throw new AppError("PHONE_NUMBER_ID is not configured", 500);
    }

    if (!ENVIRONMENTS.WHATSAPP_TOKEN) {
      throw new AppError("WHATSAPP_TOKEN is not configured", 500);
    }

    const url = `https://graph.facebook.com/v22.0/${ENVIRONMENTS.PHONE_NUMBER_ID}/messages`;

    const headers = {
      Authorization: `Bearer ${ENVIRONMENTS.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    };

    const body: {
      messaging_product: string;
      to: string;
      type: string;
      template: {
        name: string;
        language: { code: string };
        components?: Array<{
          type: string;
          parameters?: Array<{
            type: string;
            text?: string;
            image?: { link: string };
            video?: { link: string };
            document?: { link: string };
          }>;
        }>;
      };
    } = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    };

    // Agregar componentes si se proporcionan
    if (components && components.length > 0) {
      body.template.components = components;
    }

    const response = await axios.post(url, body, { headers });

    console.log(
      `[WhatsApp Service] Mensaje enviado exitosamente a ${phoneNumber} usando template ${templateName}`
    );

    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `[WhatsApp Service] Error al enviar mensaje a ${phoneNumber}:`,
        error.response?.data || error.message
      );
      throw new AppError(
        `Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`,
        500,
        false
      );
    }
    throw error;
  }
};

