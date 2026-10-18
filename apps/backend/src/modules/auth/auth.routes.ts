import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { login, logout, me, refresh, register } from "./auth.controller.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas.js";

export const authRouter = Router();
authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/logout", validateBody(refreshSchema), logout);
authRouter.post("/refresh", validateBody(refreshSchema), refresh);
authRouter.get("/me", authenticate, me);
