import type { RequestHandler } from "express";
import { AppError } from "../../utils/app-error.js";
import { sendSuccess } from "../../utils/response.js";
import { TicketService } from "./ticket.service.js";

const service = new TicketService();
const actor = (request: Parameters<RequestHandler>[0]) => request.auth!;
const ticketId = (request: Parameters<RequestHandler>[0]) => { const raw = request.params.id; const id = Array.isArray(raw) ? raw[0] : raw; if (!id) throw new AppError(400, "INVALID_TICKET_ID", "Ticket ID is required."); return id; };

export const createTicket: RequestHandler = async (request, response, next) => { try { return sendSuccess(response, await service.create(actor(request), request.body), "Ticket created successfully.", 201); } catch (error) { next(error); } };
export const listTickets: RequestHandler = async (request, response, next) => { try { return sendSuccess(response, await service.list(actor(request), request.query as never)); } catch (error) { next(error); } };
export const getTicket: RequestHandler = async (request, response, next) => { try { return sendSuccess(response, await service.get(actor(request), ticketId(request))); } catch (error) { next(error); } };
export const updateTicket: RequestHandler = async (request, response, next) => { try { return sendSuccess(response, await service.update(actor(request), ticketId(request), request.body), "Ticket updated successfully."); } catch (error) { next(error); } };
export const addMessage: RequestHandler = async (request, response, next) => { try { return sendSuccess(response, await service.addMessage(actor(request), ticketId(request), request.body), "Message sent.", 201); } catch (error) { next(error); } };
export const addFeedback: RequestHandler = async (request, response, next) => { try { return sendSuccess(response, await service.feedback(actor(request), ticketId(request), request.body), "Feedback submitted.", 201); } catch (error) { next(error); } };
