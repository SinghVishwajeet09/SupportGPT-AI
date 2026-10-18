import type { RequestHandler } from "express";
import type { z } from "zod";

export const validateBody = <T extends z.ZodType>(schema: T): RequestHandler => (request, _response, next) => {
  request.body = schema.parse(request.body);
  next();
};

export const validateQuery = <T extends z.ZodType>(schema: T): RequestHandler => (request, _response, next) => {
  request.query = schema.parse(request.query) as never;
  next();
};
