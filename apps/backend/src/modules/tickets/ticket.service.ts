import { MessageSenderType, Prisma, Role, TicketMessageKind, TicketStatus, type TicketCategory, type TicketPriority } from "@prisma/client";
import crypto from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";

type Actor = { userId: string; role: Role };
type TicketInput = { subject: string; description: string; category?: TicketCategory; priority?: TicketPriority };
type ListInput = { page: number; pageSize: number; status?: TicketStatus; priority?: TicketPriority; category?: TicketCategory; search?: string };

const ticketInclude = { customer: { select: { id: true, name: true, email: true, avatarUrl: true } }, assignedAgent: { select: { id: true, name: true, email: true, avatarUrl: true } }, messages: { orderBy: { createdAt: "asc" } } } as const;

export class TicketService {
  async create(actor: Actor, input: TicketInput) {
    if (actor.role !== Role.CUSTOMER) throw new AppError(403, "FORBIDDEN", "Only customers can create support tickets.");
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const ticket = await prisma.ticket.create({ data: { ticketNumber: this.ticketNumber(), customerId: actor.userId, subject: input.subject, description: input.description, category: input.category, priority: input.priority }, include: ticketInclude });
        await this.audit(actor.userId, "TICKET_CREATED", ticket.id, { ticketNumber: ticket.ticketNumber });
        return ticket;
      } catch (error) { if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") || attempt === 2) throw error; }
    }
    throw new AppError(500, "TICKET_CREATION_FAILED", "Could not create a ticket. Please try again.");
  }

  async list(actor: Actor, input: ListInput) {
    const where: Prisma.TicketWhereInput = { ...(input.status ? { status: input.status } : {}), ...(input.priority ? { priority: input.priority } : {}), ...(input.category ? { category: input.category } : {}), ...(input.search ? { OR: [{ ticketNumber: { contains: input.search, mode: "insensitive" } }, { subject: { contains: input.search, mode: "insensitive" } }] } : {}) };
    if (actor.role === Role.CUSTOMER) where.customerId = actor.userId;
    if (actor.role === Role.AGENT) where.assignedAgentId = actor.userId;
    const [items, total] = await prisma.$transaction([prisma.ticket.findMany({ where, include: { customer: { select: { id: true, name: true, email: true } }, assignedAgent: { select: { id: true, name: true, email: true } } }, orderBy: { updatedAt: "desc" }, skip: (input.page - 1) * input.pageSize, take: input.pageSize }), prisma.ticket.count({ where })]);
    return { items, page: input.page, pageSize: input.pageSize, total, totalPages: Math.ceil(total / input.pageSize) };
  }

  async get(actor: Actor, id: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id }, include: ticketInclude });
    if (!ticket) throw new AppError(404, "TICKET_NOT_FOUND", "Ticket was not found.");
    this.assertAccess(actor, ticket);
    if (actor.role === Role.CUSTOMER) {
      return { ...ticket, messages: ticket.messages.filter((m) => m.kind !== TicketMessageKind.INTERNAL_NOTE) };
    }
    return ticket;
  }

  async update(actor: Actor, id: string, input: { status?: TicketStatus; priority?: TicketPriority; category?: TicketCategory; assignedAgentId?: string | null }) {
    const current = await this.get(actor, id);
    if (actor.role === Role.CUSTOMER) throw new AppError(403, "FORBIDDEN", "Customers cannot change ticket workflow fields.");
    if (input.assignedAgentId !== undefined && actor.role !== Role.ADMIN) throw new AppError(403, "FORBIDDEN", "Only administrators can assign tickets.");
    if (input.assignedAgentId) { const agent = await prisma.user.findFirst({ where: { id: input.assignedAgentId, role: Role.AGENT } }); if (!agent) throw new AppError(400, "INVALID_AGENT", "Assigned user must be an active support agent."); }
    const status = input.status;
    const ticket = await prisma.ticket.update({ where: { id }, data: { ...input, ...(status === TicketStatus.RESOLVED ? { resolvedAt: new Date() } : status ? { resolvedAt: null } : {}) }, include: ticketInclude });
    await this.audit(actor.userId, "TICKET_UPDATED", id, { fromStatus: current.status, toStatus: ticket.status });
    return ticket;
  }

  async addMessage(actor: Actor, ticketId: string, input: { body: string; internal: boolean }) {
    const ticket = await this.get(actor, ticketId);
    if (input.internal && actor.role === Role.CUSTOMER) throw new AppError(403, "FORBIDDEN", "Customers cannot add internal notes.");
    const senderType = actor.role === Role.CUSTOMER ? MessageSenderType.CUSTOMER : MessageSenderType.AGENT;
    const message = await prisma.ticketMessage.create({ data: { ticketId, senderId: actor.userId, senderType, body: input.body, kind: input.internal ? TicketMessageKind.INTERNAL_NOTE : TicketMessageKind.MESSAGE } });
    await prisma.ticket.update({ where: { id: ticket.id }, data: { updatedAt: new Date(), ...(actor.role === Role.CUSTOMER && ticket.status === TicketStatus.PENDING_CUSTOMER ? { status: TicketStatus.IN_PROGRESS } : {}) } });
    return message;
  }

  async feedback(actor: Actor, ticketId: string, input: { rating: number; comment?: string }) {
    const ticket = await this.get(actor, ticketId);
    if (actor.role !== Role.CUSTOMER || ticket.customerId !== actor.userId) throw new AppError(403, "FORBIDDEN", "Only the ticket owner can leave feedback.");
    if (ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED) throw new AppError(400, "TICKET_NOT_RESOLVED", "Feedback is available once the ticket is resolved.");
    const feedback = await prisma.feedback.upsert({ where: { ticketId_customerId: { ticketId, customerId: actor.userId } }, update: input, create: { ticketId, customerId: actor.userId, ...input } });
    await this.audit(actor.userId, "TICKET_FEEDBACK_SUBMITTED", ticketId, { rating: input.rating });
    return feedback;
  }

  private assertAccess(actor: Actor, ticket: { customerId: string; assignedAgentId: string | null }) { if (actor.role === Role.ADMIN) return; if (actor.role === Role.CUSTOMER && ticket.customerId === actor.userId) return; if (actor.role === Role.AGENT && ticket.assignedAgentId === actor.userId) return; throw new AppError(403, "FORBIDDEN", "You do not have access to this ticket."); }
  private ticketNumber() { return `SUP-${new Date().getFullYear()}-${crypto.randomInt(100000, 1_000_000)}`; }
  private audit(actorId: string, action: string, resourceId: string, metadata: Prisma.InputJsonValue) { return prisma.auditLog.create({ data: { actorId, action, resource: "TICKET", resourceId, metadata } }); }
}
