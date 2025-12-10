import { env } from "node:process";
import * as cron from "node-cron";
import createApp from "./app";
import { ENVIRONMENTS } from "./config/env";
import { prisma } from "./config/prisma";
import { processDailyReminders } from "./services/reminder.service";

const app = createApp();

const PORT = ENVIRONMENTS.PORT;

async function startServer(): Promise<void> {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Configurar CRON job para ejecutarse todos los días a las 8:00 AM (hora Colombia UTC-5)
    // La expresión cron "0 13 * * *" significa: a las 13:00 UTC (8:00 AM Colombia)
    cron.schedule("0 13 * * *", async () => {
      console.log("[CRON] Ejecutando job de recordatorios diarios...");
      try {
        await processDailyReminders();
        console.log("[CRON] Job de recordatorios completado exitosamente");
      } catch (error) {
        console.error("[CRON] Error al ejecutar job de recordatorios:", error);
      }
    });

    console.log(
      "✅ CRON job configurado: Recordatorios diarios a las 8:00 AM (Colombia)"
    );

    const port = Number.parseInt(PORT, 10) || 3000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📝 Environment: ${env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
