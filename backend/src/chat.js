import { prisma } from "./db.js";
import { z } from "zod";

// Mock OpenAI for now - replace with real API calls
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function handleChatMessage(sessionId, userMessage) {
  // Check if user is asking about tracking
  const trackingMatch = userMessage.match(/track|shipment|order|status/i);
  
  if (trackingMatch) {
    return await handleTrackingQuery(userMessage);
  }

  // For now, return a helpful response
  return {
    type: "ai_response",
    content: "I can help you track your shipment. Please provide a tracking number or let me know how else I can assist!",
    confidence: 0.8
  };
}

export async function handleTrackingQuery(userMessage) {
  // Extract tracking number from message (simple pattern)
  const trackingMatch = userMessage.match(/(?:TRK-)?[A-Z0-9\-]{6,}/);
  
  if (!trackingMatch) {
    return {
      type: "ai_response",
      content: "I didn't find a tracking number in your message. Could you provide the tracking number you're looking for?",
      confidence: 0.6,
      needsEscalation: false
    };
  }

  const trackingNumber = trackingMatch[0];
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber },
    include: { events: { orderBy: { createdAt: "asc" } } }
  });

  if (!shipment) {
    return {
      type: "ai_response",
      content: `No shipment found with tracking number ${trackingNumber}. Please verify the tracking number and try again.`,
      confidence: 0.9,
      needsEscalation: false
    };
  }

  const latestEvent = shipment.events[shipment.events.length - 1];
  
  return {
    type: "tracking_info",
    content: `
Your shipment "${shipment.title}" is currently ${shipment.status.toLowerCase()}.

📍 Route: ${shipment.fromCity} → ${shipment.toCity}
📊 Status: ${latestEvent?.message || shipment.status}
📌 Last Update: ${latestEvent?.location || "N/A"}

Recent events:
${shipment.events.slice(-3).map(e => `• ${e.message} (${e.location})`).join("\n")}
    `.trim(),
    confidence: 0.95,
    needsEscalation: false,
    trackingNumber
  };
}

export async function shouldEscalate(messageContent, aiResponse) {
  // Escalate if:
  // 1. User asks for human
  // 2. AI confidence is low
  // 3. Complex issue detected

  const escalationKeywords = /(?:agent|human|representative|manager|escalate|speak to|help)/i;
  
  if (escalationKeywords.test(messageContent)) {
    return { shouldEscalate: true, reason: "User requested human support" };
  }

  if (aiResponse.confidence < 0.7) {
    return { shouldEscalate: true, reason: "AI confidence too low for accurate response" };
  }

  return { shouldEscalate: false, reason: null };
}

export async function createChatSession(visitorName, visitorEmail) {
  const sessionId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  
  return prisma.chatSession.create({
    data: {
      sessionId,
      visitorName,
      visitorEmail,
      status: "ACTIVE"
    }
  });
}

export async function saveChatMessage(sessionId, sender, content) {
  const session = await prisma.chatSession.findUnique({ where: { sessionId } });
  
  if (!session) {
    throw new Error("Chat session not found");
  }

  return prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      sender,
      content
    }
  });
}

export async function escalateChat(sessionId, reason) {
  const session = await prisma.chatSession.findUnique({ where: { sessionId } });
  
  if (!session) {
    throw new Error("Chat session not found");
  }

  await prisma.chatSession.update({
    where: { sessionId },
    data: { status: "ESCALATED" }
  });

  return prisma.chatEscalation.create({
    data: {
      sessionId: session.id,
      reason,
      status: "PENDING"
    }
  });
}

export async function getChatHistory(sessionId) {
  const session = await prisma.chatSession.findUnique({
    where: { sessionId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      escalation: true
    }
  });

  return session;
}
