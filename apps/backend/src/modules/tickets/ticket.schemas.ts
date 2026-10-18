import { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";
import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z.string().trim().min(5).max(180),
  description: z.string().trim().min(10).max(10000),
  category: z.nativeEnum(TicketCategory).optional(),
  priority: z.nativeEnum(TicketPriority).optional()
});

export const ticketListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  category: z.nativeEnum(TicketCategory).optional(),
  search: z.string().trim().max(100).optional()
});

export const updateTicketSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  category: z.nativeEnum(TicketCategory).optional(),
  assignedAgentId: z.string().uuid().nullable().optional()
}).refine((input) => Object.keys(input).length > 0, "Provide at least one ticket update.");

export const createMessageSchema = z.object({
  body: z.string().trim().min(1).max(10000),
  internal: z.boolean().optional().default(false)
});

export const feedbackSchema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(2000).optional() });
