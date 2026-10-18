import { PrismaClient, Role, TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

const prisma = new PrismaClient();
const password = "ChangeMe123!";

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({ where: { email: "admin@supportgpt.local" }, update: {}, create: { name: "Avery Admin", email: "admin@supportgpt.local", passwordHash, role: Role.ADMIN, isVerified: true } });
  const agent = await prisma.user.upsert({ where: { email: "agent@supportgpt.local" }, update: {}, create: { name: "Sam Support", email: "agent@supportgpt.local", passwordHash, role: Role.AGENT, isVerified: true } });
  const customer = await prisma.user.upsert({ where: { email: "customer@supportgpt.local" }, update: {}, create: { name: "Jordan Customer", email: "customer@supportgpt.local", passwordHash, role: Role.CUSTOMER, isVerified: true } });
  await prisma.ticket.upsert({ where: { ticketNumber: "SUP-1001" }, update: {}, create: { ticketNumber: "SUP-1001", customerId: customer.id, assignedAgentId: agent.id, subject: "Refund eligibility question", description: "I would like to understand the refund window for my order.", status: TicketStatus.OPEN, priority: TicketPriority.MEDIUM, category: TicketCategory.REFUND } });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "SEED_CREATED", resource: "SYSTEM", metadata: { source: "prisma-seed" } } });
  console.info("Seeded demo accounts. Password for local demo accounts: ChangeMe123!");
}

main().finally(() => prisma.$disconnect());
