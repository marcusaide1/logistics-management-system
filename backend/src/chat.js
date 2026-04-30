import { prisma } from "./db.js";
import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

// Knowledge base for common logistics questions
const KNOWLEDGE_BASE = {
  services: {
    patterns: [/what.*services?|what.*do.*you.*offer?|services/i],
    response: "We offer comprehensive logistics services including:\n• Freight forwarding (air, sea, ground)\n• Last-mile delivery\n• Warehousing and storage\n• Customs clearance\n• Real-time tracking\n• Payment processing\n\nWould you like to know more about any specific service?"
  },
  pricing: {
    patterns: [/how.*much|cost|price|fee|charge/i],
    response: "Our pricing depends on several factors:\n• Shipment weight and dimensions\n• Origin and destination\n• Service type (standard/express)\n• Additional services (insurance, customs)\n\nFor a personalized quote, please contact our sales team at sales@logiflow.example or use our contact form."
  },
  contact: {
    patterns: [/contact|phone|email|support|help/i],
    response: "You can reach us through:\n• Email: support@logiflow.example\n• Phone: 1-800-LOGISTICS\n• Live chat: You're talking to us now!\n• Contact form: Available on our website\n\nOur support team is available 24/7."
  },
  delivery: {
    patterns: [/delivery.*time|how.*long|estimate|when.*arrive/i],
    response: "Delivery times vary by service:\n• Standard ground: 3-7 business days\n• Express ground: 1-2 business days\n• Air freight: 2-5 business days\n• International: 7-21 business days\n\nFor specific shipment estimates, please provide the tracking number."
  }
};

export async function handleChatMessage(sessionId, userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  // Check for tracking queries first
  if (lowerMessage.match(/track|shipment|order|status/i)) {
    return await handleTrackingQuery(userMessage);
  }

  // Check knowledge base for common questions
  for (const [category, data] of Object.entries(KNOWLEDGE_BASE)) {
    if (data.patterns.some(pattern => pattern.test(lowerMessage))) {
      return {
        type: "knowledge_response",
        content: data.response,
        confidence: 0.85,
        category
      };
    }
  }

  // Check for escalation keywords
  if (lowerMessage.match(/agent|human|representative|manager|speak.*to.*person/i)) {
    return {
      type: "escalation_request",
      content: "I'll connect you with a human agent right away. Please hold for a moment.",
      confidence: 0.95,
      needsEscalation: true
    };
  }

  // Use OpenAI if available, otherwise fallback to basic response
  if (OPENAI_API_KEY) {
    try {
      return await handleOpenAIQuery(userMessage);
    } catch (error) {
      console.error("OpenAI error:", error);
      // Fallback to basic response
    }
  }

  // Default helpful response
  return {
    type: "general_response",
    content: "I'm here to help with your logistics needs! I can:\n• Track shipments\n• Answer questions about our services\n• Help with pricing information\n• Connect you with support\n\nWhat would you like to know?",
    confidence: 0.7
  };
}

export async function handleOpenAIQuery(userMessage) {
  const systemPrompt = `You are LogiFlow AI Assistant, a helpful customer service agent for a logistics company.

COMPANY INFO:
- Name: LogiFlow
- Services: Freight forwarding, last-mile delivery, warehousing, customs clearance
- Support: 24/7 via email, phone, and live chat
- Contact: support@logiflow.example

YOUR CAPABILITIES:
- Answer questions about logistics services
- Help with general inquiries
- Provide information about shipping processes
- Explain terms and procedures
- Be friendly and professional

IMPORTANT RULES:
- If asked about specific shipment tracking, say you'll check the system and provide status
- For pricing quotes, direct to sales team
- For urgent issues, offer to escalate to human agent
- Never make up information about specific shipments
- Always be helpful and accurate

If the user asks something you can't answer definitively, offer to connect them with a human agent.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";

    // Analyze response for escalation needs
    const needsEscalation = aiResponse.toLowerCase().includes("escalate") ||
                           aiResponse.toLowerCase().includes("human agent") ||
                           aiResponse.toLowerCase().includes("speak to someone");

    return {
      type: "openai_response",
      content: aiResponse,
      confidence: 0.9,
      needsEscalation
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

export async function handleTrackingQuery(userMessage) {
  // Improved tracking number extraction with multiple patterns
  const trackingPatterns = [
    /(?:TRK-|tracking.*number.*)?([A-Z0-9\-]{6,})/i,
    /(?:order.*number|shipment.*id).?([A-Z0-9\-]{6,})/i,
    /([A-Z]{3}-[A-Z0-9\-]{6,})/i
  ];

  let trackingNumber = null;
  for (const pattern of trackingPatterns) {
    const match = userMessage.match(pattern);
    if (match && match[1]) {
      trackingNumber = match[1].toUpperCase();
      break;
    }
  }

  if (!trackingNumber) {
    return {
      type: "ai_response",
      content: "I need a tracking number to help you. Please provide your tracking number (it usually starts with 'TRK-' or is 6+ characters long).",
      confidence: 0.8,
      needsEscalation: false
    };
  }

  try {
    const shipment = await prisma.shipment.findUnique({
      where: { trackingNumber },
      include: {
        events: { orderBy: { createdAt: "desc" }, take: 5 },
        user: { select: { name: true, email: true } }
      }
    });

    if (!shipment) {
      return {
        type: "tracking_not_found",
        content: `I couldn't find a shipment with tracking number "${trackingNumber}". Please double-check the number or contact support if you believe this is an error.`,
        confidence: 0.95,
        needsEscalation: false,
        trackingNumber
      };
    }

    // Format status for better readability
    const statusMap = {
      'CREATED': 'Order Created',
      'PICKED_UP': 'Picked Up',
      'IN_TRANSIT': 'In Transit',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'EXCEPTION': 'Exception'
    };

    const currentStatus = statusMap[shipment.status] || shipment.status;
    const lastEvent = shipment.events[0];

    let response = `📦 **Shipment Status for ${trackingNumber}**\n\n`;
    response += `**Title:** ${shipment.title}\n`;
    response += `**Route:** ${shipment.fromCity} → ${shipment.toCity}\n`;
    response += `**Current Status:** ${currentStatus}\n`;

    if (lastEvent) {
      response += `**Last Update:** ${lastEvent.message}`;
      if (lastEvent.location) {
        response += ` (${lastEvent.location})`;
      }
      response += `\n`;
    }

    if (shipment.events.length > 1) {
      response += `\n**Recent Activity:**\n`;
      shipment.events.slice(0, 3).forEach(event => {
        const time = new Date(event.createdAt).toLocaleDateString();
        response += `• ${time}: ${event.message}`;
        if (event.location) response += ` (${event.location})`;
        response += `\n`;
      });
    }

    // Add helpful next steps based on status
    if (shipment.status === 'DELIVERED') {
      response += `\n✅ Your shipment has been delivered! If you have any questions about the delivery, feel free to ask.`;
    } else if (shipment.status === 'EXCEPTION') {
      response += `\n⚠️ There's an exception with your shipment. A support agent will contact you soon, or you can reach out to us directly.`;
    } else {
      response += `\n📱 We'll send you updates as your shipment progresses. You can also check back anytime with this tracking number.`;
    }

    return {
      type: "tracking_info",
      content: response,
      confidence: 0.98,
      needsEscalation: false,
      trackingNumber,
      shipmentData: {
        status: shipment.status,
        title: shipment.title,
        route: `${shipment.fromCity} → ${shipment.toCity}`
      }
    };

  } catch (error) {
    console.error("Tracking query error:", error);
    return {
      type: "error_response",
      content: "I'm having trouble accessing the tracking system right now. Please try again in a moment, or contact support for immediate assistance.",
      confidence: 0.5,
      needsEscalation: true
    };
  }
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
