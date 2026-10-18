import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { addFeedback, addMessage, createTicket, getTicket, listTickets, updateTicket } from "./ticket.controller.js";
import { createMessageSchema, createTicketSchema, feedbackSchema, ticketListSchema, updateTicketSchema } from "./ticket.schemas.js";

export const ticketRouter = Router();
ticketRouter.use(authenticate);
ticketRouter.post("/", validateBody(createTicketSchema), createTicket);
ticketRouter.get("/", validateQuery(ticketListSchema), listTickets);
ticketRouter.get("/:id", getTicket);
ticketRouter.patch("/:id", validateBody(updateTicketSchema), updateTicket);
ticketRouter.post("/:id/messages", validateBody(createMessageSchema), addMessage);
ticketRouter.post("/:id/feedback", validateBody(feedbackSchema), addFeedback);
