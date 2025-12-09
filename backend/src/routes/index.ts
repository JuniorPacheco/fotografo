import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth.routes";
import clientsRouter from "./clients.routes";
import invoicesRouter from "./invoices.routes";
import sessionsRouter from "./sessions.routes";
import paymentsRouter from "./payments.routes";
import packagesRouter from "./packages.routes";
import remindersRouter from "./reminders.routes";
import googleCalendarRouter from "./googleCalendar.routes";

const router: Router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/clients", clientsRouter);
router.use("/invoices", invoicesRouter);
router.use("/sessions", sessionsRouter);
router.use("/payments", paymentsRouter);
router.use("/packages", packagesRouter);
router.use("/reminders", remindersRouter);
router.use("/google-calendar", googleCalendarRouter);

export default router;
