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
  console.log(
    "Allowed Origins:",
    ENVIRONMENTS.ALLOWED_ORIGINS,
    ENVIRONMENTS.ALLOWED_ORIGINS?.split(",") || "*"
  );
  // 1. Security middleware (ALWAYS FIRST)
  app.use(helmet());
  app.disable("x-powered-by");
  app.use(
    cors({
      origin: ENVIRONMENTS.ALLOWED_ORIGINS?.split(",") || "*",
      credentials: true,
    })
  );

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
