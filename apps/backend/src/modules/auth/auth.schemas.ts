import { z } from "zod";

const password = z.string().min(12, "Password must contain at least 12 characters.").max(128);
export const registerSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.email().transform((value) => value.toLowerCase()), password });
export const loginSchema = z.object({ email: z.email().transform((value) => value.toLowerCase()), password: z.string().min(1).max(128) });
export const refreshSchema = z.object({ refreshToken: z.string().min(1).optional() });
