-- Initial SupportGPT transactional schema. Generated from prisma/schema.prisma.
CREATE SCHEMA IF NOT EXISTS "public";
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'AGENT', 'ADMIN');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED');
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "TicketCategory" AS ENUM ('BILLING', 'REFUND', 'DELIVERY', 'TECHNICAL_ISSUE', 'ACCOUNT', 'PRODUCT', 'SUBSCRIPTION', 'OTHER');
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'FRUSTRATED', 'ANGRY', 'URGENT');
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'CLOSED');
CREATE TYPE "MessageSenderType" AS ENUM ('CUSTOMER', 'AGENT', 'AI', 'SYSTEM');
CREATE TYPE "TicketMessageKind" AS ENUM ('MESSAGE', 'INTERNAL_NOTE', 'SYSTEM_EVENT', 'AI_SUGGESTION');
CREATE TYPE "DocumentProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED', 'DELETED');

CREATE TABLE "User" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "role" "Role" NOT NULL DEFAULT 'CUSTOMER', "avatarUrl" TEXT, "isVerified" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE TABLE "RefreshToken" ("id" TEXT NOT NULL, "tokenHash" TEXT NOT NULL, "userId" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "revokedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Ticket" ("id" TEXT NOT NULL, "ticketNumber" TEXT NOT NULL, "customerId" TEXT NOT NULL, "assignedAgentId" TEXT, "subject" TEXT NOT NULL, "description" TEXT NOT NULL, "status" "TicketStatus" NOT NULL DEFAULT 'OPEN', "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM', "category" "TicketCategory" NOT NULL DEFAULT 'OTHER', "sentiment" "Sentiment" NOT NULL DEFAULT 'NEUTRAL', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "resolvedAt" TIMESTAMP(3), CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id"));
CREATE TABLE "TicketMessage" ("id" TEXT NOT NULL, "ticketId" TEXT NOT NULL, "senderId" TEXT, "senderType" "MessageSenderType" NOT NULL, "body" TEXT NOT NULL, "kind" "TicketMessageKind" NOT NULL DEFAULT 'MESSAGE', "readAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Conversation" ("id" TEXT NOT NULL, "customerId" TEXT NOT NULL, "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE', "summary" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ConversationMessage" ("id" TEXT NOT NULL, "conversationId" TEXT NOT NULL, "senderId" TEXT, "senderType" "MessageSenderType" NOT NULL, "content" TEXT NOT NULL, "sources" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Document" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "fileType" TEXT NOT NULL, "fileSize" INTEGER NOT NULL, "storagePath" TEXT NOT NULL, "uploadedById" TEXT NOT NULL, "processingStatus" "DocumentProcessingStatus" NOT NULL DEFAULT 'PENDING', "chunkCount" INTEGER NOT NULL DEFAULT 0, "errorMessage" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Document_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Feedback" ("id" TEXT NOT NULL, "ticketId" TEXT NOT NULL, "customerId" TEXT NOT NULL, "rating" INTEGER NOT NULL, "comment" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Notification" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "title" TEXT NOT NULL, "body" TEXT NOT NULL, "readAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"));
CREATE TABLE "AuditLog" ("id" TEXT NOT NULL, "actorId" TEXT, "action" TEXT NOT NULL, "resource" TEXT NOT NULL, "resourceId" TEXT, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX "RefreshToken_userId_expiresAt_idx" ON "RefreshToken"("userId", "expiresAt");
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");
CREATE INDEX "Ticket_customerId_status_idx" ON "Ticket"("customerId", "status");
CREATE INDEX "Ticket_assignedAgentId_status_idx" ON "Ticket"("assignedAgentId", "status");
CREATE INDEX "Ticket_priority_status_idx" ON "Ticket"("priority", "status");
CREATE INDEX "TicketMessage_ticketId_createdAt_idx" ON "TicketMessage"("ticketId", "createdAt");
CREATE INDEX "Conversation_customerId_updatedAt_idx" ON "Conversation"("customerId", "updatedAt");
CREATE INDEX "ConversationMessage_conversationId_createdAt_idx" ON "ConversationMessage"("conversationId", "createdAt");
CREATE INDEX "Document_processingStatus_createdAt_idx" ON "Document"("processingStatus", "createdAt");
CREATE UNIQUE INDEX "Feedback_ticketId_customerId_key" ON "Feedback"("ticketId", "customerId");
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");
CREATE INDEX "AuditLog_resource_resourceId_createdAt_idx" ON "AuditLog"("resource", "resourceId", "createdAt");

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
