import "dotenv/config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "./db.js";

function randomPassword() {
  return crypto.randomBytes(8).toString("base64url");
}

async function upsertUser({ email, password, name, role, updatePassword = false }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const data = { name, role };
    if (updatePassword) {
      data.password = await bcrypt.hash(password, 10);
    }
    return prisma.user.update({
      where: { email },
      data
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { email, password: passwordHash, name, role }
  });
}

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD || randomPassword();
  const clientPassword = process.env.CLIENT_PASSWORD || randomPassword();
  const adminEmail = process.env.ADMIN_EMAIL || "admin@logi.local";
  const clientEmail = process.env.CLIENT_EMAIL || "client@logi.local";

  const admin = await upsertUser({
    email: adminEmail,
    password: adminPassword,
    name: "Operations Admin",
    role: "ADMIN",
    updatePassword: Boolean(process.env.ADMIN_PASSWORD)
  });

  const client = await upsertUser({
    email: clientEmail,
    password: clientPassword,
    name: "Demo Client",
    role: "CLIENT",
    updatePassword: Boolean(process.env.CLIENT_PASSWORD)
  });

  const existingDemo = await prisma.shipment.findFirst({
    where: { trackingNumber: "DEMO-TRACK-001" }
  });

  if (!existingDemo) {
    await prisma.shipment.create({
      data: {
        trackingNumber: "DEMO-TRACK-001",
        title: "Electronics pallet",
        fromCity: "Houston, TX",
        toCity: "Atlanta, GA",
        status: "IN_TRANSIT",
        userId: client.id,
        events: {
          create: [
            {
              status: "CREATED",
              message: "Shipment created",
              location: "Houston, TX"
            },
            {
              status: "PICKED_UP",
              message: "Picked up from shipper",
              location: "Houston, TX"
            },
            {
              status: "IN_TRANSIT",
              message: "In transit to destination hub",
              location: "En route"
            }
          ]
        }
      }
    });
  }

  console.log("Seed complete:", { admin: admin.email, client: client.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
