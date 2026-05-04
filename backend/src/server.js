import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./db.js";
import { authRequired, requireRole, signToken } from "./auth.js";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { handleChatMessage, shouldEscalate, createChatSession, saveChatMessage, escalateChat, getChatHistory } from "./chat.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin === "*" ? true : corsOrigin,
    credentials: true
  })
);

let systemOnline = process.env.SYSTEM_ONLINE !== "false";
const offlineMessage =
  process.env.OFFLINE_MESSAGE ||
  "The service is currently offline. Please wait until support is available.";

function systemOnlineRequired(req, res, next) {
  if (!systemOnline) {
    return res.status(503).json({ error: offlineMessage });
  }
  return next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/system/status", (_req, res) => {
  res.json({ online: systemOnline });
});

app.post("/system/status", authRequired(), requireRole("ADMIN"), async (req, res) => {
  const schema = z.object({ online: z.boolean() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  systemOnline = parsed.data.online;
  return res.json({ online: systemOnline });
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional()
});

app.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: passwordHash, name, role: "CLIENT" }
  });

  const token = signToken(user);
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8)
});

app.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(parsed.data.password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user);
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.post("/auth/forgot-password", async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const responsePayload = { message: "If an account exists for that email, a reset token has been created." };

  if (!user) {
    return res.json(responsePayload);
  }

  const resetToken = Math.random().toString(36).slice(2, 14) + Math.random().toString(36).slice(2, 14);
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { email: parsed.data.email },
    data: { resetToken, resetTokenExpiry: expiry }
  });

  const devResponse = process.env.NODE_ENV === "production" ? {} : { resetToken };
  return res.json({ ...responsePayload, ...devResponse });
});

app.post("/auth/reset-password", async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const now = new Date();
  const user = await prisma.user.findFirst({
    where: {
      resetToken: parsed.data.token,
      resetTokenExpiry: { gt: now }
    }
  });

  if (!user) return res.status(400).json({ error: "Invalid or expired reset token" });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: passwordHash,
      resetToken: null,
      resetTokenExpiry: null
    }
  });

  return res.json({ message: "Password reset successful. You may now sign in." });
});

app.get("/me", authRequired(), systemOnlineRequired, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  });
  return res.json({ user });
});

app.get("/public/shipments/:trackingNumber", async (req, res) => {
  const trackingNumber = req.params.trackingNumber.trim();
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber },
    include: { events: { orderBy: { createdAt: "asc" } } }
  });
  if (!shipment) return res.status(404).json({ error: "Not found" });
  return res.json({ shipment });
});

app.post("/contact", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    subject: z.string().min(2),
    message: z.string().min(10)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const msg = await prisma.contactMessage.create({ data: parsed.data });
  return res.json({ id: msg.id });
});

app.get("/shipments", authRequired(), systemOnlineRequired, async (req, res) => {
  if (req.user.role === "ADMIN") {
    const shipments = await prisma.shipment.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        events: { orderBy: { createdAt: "desc" }, take: 1 }
      }
    });
    return res.json({ shipments });
  }

  const shipments = await prisma.shipment.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: "desc" },
    include: { events: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
  return res.json({ shipments });
});

const createShipmentSchema = z.object({
  title: z.string().min(2),
  fromCity: z.string().min(2),
  toCity: z.string().min(2),
  clientEmail: z.string().email().optional(),
  trackingNumber: z.string().min(6).optional()
});

app.post("/shipments", authRequired(), systemOnlineRequired, requireRole("ADMIN"), async (req, res) => {
  const parsed = createShipmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const trackingNumber =
    parsed.data.trackingNumber ||
    `TRK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  let userId = null;
  if (parsed.data.clientEmail) {
    const u = await prisma.user.findUnique({ where: { email: parsed.data.clientEmail } });
    userId = u?.id ?? null;
  }

  const shipment = await prisma.shipment.create({
    data: {
      trackingNumber,
      title: parsed.data.title,
      fromCity: parsed.data.fromCity,
      toCity: parsed.data.toCity,
      status: "CREATED",
      userId,
      events: {
        create: {
          status: "CREATED",
          message: "Shipment created",
          location: parsed.data.fromCity
        }
      }
    },
    include: { events: { orderBy: { createdAt: "asc" } } }
  });

  return res.json({ shipment });
});

const addEventSchema = z.object({
  status: z.enum([
    "CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "EXCEPTION"
  ]),
  message: z.string().min(2),
  location: z.string().optional()
});

app.post("/shipments/:id/events", authRequired(), systemOnlineRequired, requireRole("ADMIN"), async (req, res) => {
  const parsed = addEventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const id = req.params.id;
  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.$transaction(async (tx) => {
    await tx.shipmentEvent.create({
      data: {
        shipmentId: id,
        status: parsed.data.status,
        message: parsed.data.message,
        location: parsed.data.location
      }
    });
    return tx.shipment.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { events: { orderBy: { createdAt: "asc" } } }
    });
  });

  return res.json({ shipment: updated });
});

app.get("/payments", authRequired(), systemOnlineRequired, async (req, res) => {
  if (req.user.role === "ADMIN") {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        shipment: { select: { id: true, trackingNumber: true, title: true } }
      }
    });
    return res.json({ payments });
  }

  const payments = await prisma.payment.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: { shipment: { select: { id: true, trackingNumber: true, title: true } } }
  });
  return res.json({ payments });
});

const checkoutSchema = z.object({
  amountCents: z.number().int().positive(),
  currency: z.string().min(3).max(5).optional(),
  shipmentId: z.string().optional()
});

app.post("/payments/checkout", authRequired(), systemOnlineRequired, async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  if (req.user.role !== "CLIENT") {
    return res.status(403).json({ error: "Only clients can create payments in this demo" });
  }

  if (parsed.data.shipmentId) {
    const shipment = await prisma.shipment.findUnique({ where: { id: parsed.data.shipmentId } });
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });
    if (shipment.userId && shipment.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
  }

  const payment = await prisma.payment.create({
    data: {
      amountCents: parsed.data.amountCents,
      currency: parsed.data.currency ?? "USD",
      status: "PENDING",
      userId: req.user.id,
      shipmentId: parsed.data.shipmentId ?? null
    }
  });

  return res.json({ payment });
});

app.post("/payments/:id/mark-paid", authRequired(), systemOnlineRequired, requireRole("ADMIN"), async (req, res) => {
  const id = req.params.id;
  const payment = await prisma.payment.update({
    where: { id },
    data: { status: "PAID" }
  });
  return res.json({ payment });
});

app.get("/admin/users", authRequired(), systemOnlineRequired, requireRole("ADMIN"), async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  });
  return res.json({ users });
});

// Chat API endpoints
app.post("/chat/session", systemOnlineRequired, async (req, res) => {
  const schema = z.object({
    visitorName: z.string().optional(),
    visitorEmail: z.string().email().nullable().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const session = await createChatSession(parsed.data.visitorName, parsed.data.visitorEmail);
  return res.json({ session: { sessionId: session.sessionId, id: session.id } });
});

app.post("/chat/message", systemOnlineRequired, async (req, res) => {
  const schema = z.object({
    sessionId: z.string(),
    message: z.string().min(1)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  try {
    // Save user message
    await saveChatMessage(parsed.data.sessionId, "user", parsed.data.message);

    // Get AI response
    const aiResponse = await handleChatMessage(parsed.data.sessionId, parsed.data.message);
    
    // Check if needs escalation
    const { shouldEscalate: needsEscalation, reason } = await shouldEscalate(parsed.data.message, aiResponse);
    
    // Save AI response
    await saveChatMessage(parsed.data.sessionId, "ai", aiResponse.content);

    if (needsEscalation) {
      const escalation = await escalateChat(parsed.data.sessionId, reason);
      return res.json({
        response: aiResponse,
        escalated: true,
        escalationId: escalation.id
      });
    }

    return res.json({ response: aiResponse, escalated: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Chat error" });
  }
});

app.get("/chat/history/:sessionId", systemOnlineRequired, async (req, res) => {
  try {
    const history = await getChatHistory(req.params.sessionId);
    if (!history) return res.status(404).json({ error: "Session not found" });
    return res.json({ history });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/chat/escalate", authRequired(), systemOnlineRequired, requireRole("ADMIN"), async (req, res) => {
  const schema = z.object({
    escalationId: z.string(),
    assignedTo: z.string().email()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  try {
    const escalation = await prisma.chatEscalation.update({
      where: { id: parsed.data.escalationId },
      data: {
        status: "IN_PROGRESS",
        assignedTo: parsed.data.assignedTo
      }
    });
    return res.json({ escalation });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
