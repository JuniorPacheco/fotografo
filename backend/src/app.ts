import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { ENVIRONMENTS } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import routes from "./routes";
import { setupSwagger } from "./config/swagger";

function createApp(): Express {
  const app = express();

  // Configurar CORS antes de Helmet para evitar conflictos
  // Parsear ALLOWED_ORIGINS correctamente
  const allowedOrigins = ENVIRONMENTS.ALLOWED_ORIGINS
    ? ENVIRONMENTS.ALLOWED_ORIGINS.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

  // Configurar CORS con validación de origen
  app.use(
    cors({
      origin: (origin, callback) => {
        // Permitir requests sin origen (mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }

        // Si no hay orígenes configurados, permitir todos (solo en desarrollo)
        if (allowedOrigins.length === 0) {
          if (ENVIRONMENTS.DEVELOPMENT === "development") {
            return callback(null, true);
          }
          // En producción, rechazar si no hay orígenes configurados
          return callback(new Error("CORS: No allowed origins configured"));
        }

        // Verificar si el origen está en la lista permitida
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Rechazar el origen
        return callback(new Error(`CORS: Origin ${origin} is not allowed`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // 1. Security middleware (después de CORS)
  app.use(
    helmet({
      // Configurar Helmet para que no bloquee CORS
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
    })
  );
  app.disable("x-powered-by");

  // 2. Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // 3. Logging
  if (ENVIRONMENTS.DEVELOPMENT === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // 4. Swagger UI (only in development)
  if (ENVIRONMENTS.DEVELOPMENT === "development") {
    setupSwagger(app);
  }

  // 5. Routes
  app.use("/api/v1", routes);

  // 6. 404 handler
  app.use(notFoundHandler);

  // 7. Error handling middleware (MUST BE LAST)
  app.use(errorHandler);

  return app;
}

export default createApp;
