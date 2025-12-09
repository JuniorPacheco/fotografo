import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fotografo API",
      version: "1.0.0",
      description: "API para gestión de facturas y sesiones de fotografía",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    tags: [
      {
        name: "Health",
        description: "Health check endpoints",
      },
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Clients",
        description: "Client management endpoints (OWNER and ADMIN only)",
      },
      {
        name: "Invoices",
        description: "Invoice management endpoints (OWNER and ADMIN only)",
      },
      {
        name: "Sessions",
        description: "Session management endpoints (OWNER and ADMIN only)",
      },
      {
        name: "Payments",
        description: "Payment management endpoints (OWNER and ADMIN only)",
      },
      {
        name: "Google Calendar",
        description: "Google Calendar integration endpoints",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
