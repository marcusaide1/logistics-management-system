import jwt from "jsonwebtoken";
import { prisma } from "./db.js";

export function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn: "7d" });
}

export function authRequired() {
  return async (req, res, next) => {
    try {
      const hdr = req.headers.authorization || "";
      const token = hdr.startsWith("Bearer ") ? hdr.slice("Bearer ".length) : null;
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      const secret = process.env.JWT_SECRET;
      const payload = jwt.verify(token, secret);
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
      return next();
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== role) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}

