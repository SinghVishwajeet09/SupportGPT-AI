import { PrismaClient } from "@prisma/client";
import { loadEnvironment } from "../config/env.js";

loadEnvironment();
export const prisma = new PrismaClient();
