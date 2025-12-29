import dotenv from "dotenv";
dotenv.config();

export const ENVIRONMENTS = {
  DEVELOPMENT: process.env.NODE_ENV,
  PORT: process.env.PORT || "3000",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  FRONTEND_URL: process.env.FRONTEND_URL,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL,
  BREVO_FROM_NAME: process.env.BREVO_FROM_NAME,
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
};
