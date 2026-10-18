import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";
import { logger } from "../config/logger.js";

export const notFound: RequestHandler = (request, _response, next) => next(new AppError(404, "NOT_FOUND", `Route ${request.method} ${request.path} was not found.`));

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (error instanceof ZodError) {
    return response.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request.", details: error.flatten() } });
  }
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ success: false, error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } });
  }
  logger.error({ err: error, requestId: request.id }, "Unhandled request error");
  return response.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." } });
};
