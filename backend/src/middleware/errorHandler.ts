import { Request, Response } from "express";
import { ENVIRONMENTS } from "../config/env";
import { AppError } from "../utils/errors";

export const errorHandler = (err: Error, req: Request, res: Response): void => {
  console.error("Error:", {
    message: err.message,
    stack: ENVIRONMENTS.DEVELOPMENT === "development" ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      error: { message: err.message },
    });
    return;
  }

  res.status(500).json({
    error: {
      message:
        ENVIRONMENTS.DEVELOPMENT === "production"
          ? "Internal server error"
          : err.message,
    },
  });
};
